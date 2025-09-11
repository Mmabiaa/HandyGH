import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

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
        const { paymentIntentId } = await req?.json();
        
        if (!paymentIntentId) {
            return new Response(JSON.stringify({
                error: 'Payment Intent ID is required'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe?.paymentIntents?.retrieve(paymentIntentId);

        // Find corresponding booking
        const { data: booking, error: bookingError } = await supabase?.from('service_bookings')?.select('*')?.eq('payment_intent_id', paymentIntentId)?.single();

        if (bookingError || !booking) {
            return new Response(JSON.stringify({
                error: 'Booking not found'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404
            });
        }

        // Update booking status based on payment status
        let bookingStatus = 'pending';
        let paymentStatus = 'pending';

        switch (paymentIntent?.status) {
            case 'succeeded':
                bookingStatus = 'confirmed';
                paymentStatus = 'succeeded';
                break;
            case 'requires_payment_method': 
            case 'requires_confirmation': 
            case 'requires_action':
                bookingStatus = 'pending';
                paymentStatus = 'pending';
                break;
            case 'canceled':
                bookingStatus = 'cancelled';
                paymentStatus = 'failed';
                break;
            default:
                bookingStatus = 'pending';
                paymentStatus = 'pending';
        }

        // Update booking in database
        const { error: updateError } = await supabase?.from('service_bookings')?.update({
                status: bookingStatus,
                payment_status: paymentStatus,
                updated_at: new Date()?.toISOString()
            })?.eq('id', booking?.id);

        if (updateError) {
            console.error('Booking update error:', updateError);
            return new Response(JSON.stringify({
                error: 'Failed to update booking'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            });
        }

        // Update payment transaction
        await supabase?.from('payment_transactions')?.update({
                status: paymentStatus,
                stripe_charge_id: paymentIntent?.latest_charge,
                metadata: {
                    stripe_payment_intent: paymentIntent,
                    confirmed_at: new Date()?.toISOString()
                }
            })?.eq('payment_intent_id', paymentIntentId);

        // Return the Stripe checkout session
        return new Response(JSON.stringify({
            success: true,
            booking: {
                ...booking,
                status: bookingStatus,
                payment_status: paymentStatus
            },
            payment_intent: paymentIntent
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Payment confirmation error:', error);
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