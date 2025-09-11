import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// Add Deno declaration for TypeScript compatibility
declare const Deno: {
    env: {
        get(key: string): string | undefined;
    };
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*' // DO NOT CHANGE THIS
};

serve(async (req) => {
    // Handle CORS preflight request
    if (req?.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders
        });
    }
    
    try {
        // Create a Supabase client
        const supabaseUrl = Deno?.env?.get('SUPABASE_URL');
        const supabaseKey = Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Create a Stripe client
        const stripeKey = Deno?.env?.get('STRIPE_SECRET_KEY');
        const stripe = new Stripe(stripeKey);
        
        // Get the request body
        const { bookingData, customerInfo } = await req?.json();
        
        // Validate required data
        if (!bookingData || !customerInfo) {
            return new Response(JSON.stringify({
                error: 'Booking data and customer info are required'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        // Generate booking number
        const bookingNumber = `BK-${new Date()?.getFullYear()}-${Math.random()?.toString()?.substr(2, 8)}`;

        // Calculate total amount in cents (Ghana Cedi)
        const totalAmount = Math.round(bookingData?.totalAmount * 100);

        // Create or get Stripe customer
        let stripeCustomer;
        const customerData = {
            name: `${customerInfo?.firstName} ${customerInfo?.lastName}`,
            email: customerInfo?.email,
            phone: customerInfo?.phone,
            address: {
                line1: bookingData?.location?.address || '',
                city: bookingData?.location?.city || 'Accra',
                state: bookingData?.location?.region || 'Greater Accra',
                country: 'GH'
            }
        };

        if (customerInfo?.stripeCustomerId) {
            stripeCustomer = await stripe?.customers?.update(customerInfo?.stripeCustomerId, customerData);
        } else {
            stripeCustomer = await stripe?.customers?.create(customerData);
            
            // Update user profile with Stripe customer ID
            await supabase?.from('user_profiles')?.update({ stripe_customer_id: stripeCustomer?.id })?.eq('id', customerInfo?.userId);
        }

        // Create payment intent
        const paymentIntent = await stripe?.paymentIntents?.create({
            amount: totalAmount,
            currency: 'ghs',
            customer: stripeCustomer?.id,
            description: `HandyGH Service Booking: ${bookingData?.serviceName}`,
            metadata: {
                booking_number: bookingNumber,
                customer_name: customerData?.name,
                customer_email: customerInfo?.email,
                service_name: bookingData?.serviceName,
                scheduled_date: bookingData?.dateTime?.date || '',
                scheduled_time: bookingData?.dateTime?.time || ''
            }
        });

        // Save booking to database
        const { data: booking, error: bookingError } = await supabase?.from('service_bookings')?.insert({
                customer_id: customerInfo?.userId,
                provider_id: bookingData?.providerId,
                service_id: bookingData?.serviceId,
                booking_number: bookingNumber,
                service_name: bookingData?.serviceName,
                service_description: bookingData?.serviceDescription || '',
                scheduled_date: bookingData?.dateTime?.date,
                scheduled_time: bookingData?.dateTime?.time,
                duration_minutes: bookingData?.duration || 60,
                service_address: bookingData?.location,
                base_price: bookingData?.basePrice || bookingData?.totalAmount,
                additional_charges: bookingData?.additionalCharges || 0,
                total_amount: bookingData?.totalAmount,
                currency: 'GHS',
                status: 'pending',
                payment_status: 'pending',
                payment_intent_id: paymentIntent?.id,
                special_instructions: bookingData?.serviceDetails?.requirements || '',
                customer_notes: bookingData?.serviceDetails?.urgentNotes || ''
            })?.select()?.single();

        if (bookingError) {
            console.error('Booking creation error:', bookingError);
            return new Response(JSON.stringify({
                error: 'Failed to create booking'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            });
        }

        // Save payment transaction
        await supabase?.from('payment_transactions')?.insert({
                booking_id: booking?.id,
                payment_intent_id: paymentIntent?.id,
                amount: bookingData?.totalAmount,
                currency: 'GHS',
                status: 'pending',
                transaction_type: 'payment',
                gateway: 'stripe'
            });

        // Return the payment intent client secret
        return new Response(JSON.stringify({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            bookingId: booking.id,
            bookingNumber: bookingNumber,
            amount: totalAmount,
            currency: paymentIntent.currency
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Payment intent creation error:', error);
        return new Response(JSON.stringify({
            error: error.message
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 400
        });
    }
});