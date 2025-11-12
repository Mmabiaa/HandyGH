"""
Views for payments app.
"""

import logging
import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction as db_transaction
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Transaction, Commission
from .serializers import (
    TransactionSerializer,
    MoMoChargeRequestSerializer,
    MoMoChargeResponseSerializer,
    MoMoWebhookSerializer,
    ManualPaymentConfirmSerializer,
    CommissionSerializer,
)
from .services import PaymentService, MoMoService
from apps.bookings.models import Booking
from core.permissions import IsAdmin
from core.exceptions import ValidationError, NotFoundError

logger = logging.getLogger(__name__)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing transactions.
    
    Customers can view their own transactions.
    Providers can view transactions they're involved in.
    Admins can view all transactions.
    """
    
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter transactions based on user role."""
        user = self.request.user
        
        if user.role == 'ADMIN':
            return Transaction.objects.all().select_related(
                'booking',
                'customer',
                'provider'
            )
        elif user.role == 'PROVIDER':
            # Provider sees transactions where they are the provider
            return Transaction.objects.filter(
                provider=user
            ).select_related('booking', 'customer', 'provider')
        else:
            # Customer sees their own transactions
            return Transaction.objects.filter(
                customer=user
            ).select_related('booking', 'customer', 'provider')
    
    @swagger_auto_schema(
        operation_description="List transactions for the authenticated user",
        responses={200: TransactionSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        """List transactions."""
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Retrieve a specific transaction",
        responses={200: TransactionSerializer()}
    )
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a transaction."""
        return super().retrieve(request, *args, **kwargs)


@swagger_auto_schema(
    method='post',
    operation_description="Initiate MoMo payment for a booking",
    request_body=MoMoChargeRequestSerializer,
    responses={
        200: MoMoChargeResponseSerializer(),
        400: "Bad request",
        404: "Booking not found"
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def momo_charge(request):
    """
    Initiate MoMo charge for a booking.
    
    Creates a transaction and initiates payment with MoMo provider.
    """
    serializer = MoMoChargeRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    booking_id = serializer.validated_data['booking_id']
    phone = serializer.validated_data['phone']
    
    try:
        # Get booking
        booking = Booking.objects.select_related('customer', 'provider').get(
            id=booking_id
        )
        
        # Verify user is the customer
        if booking.customer != request.user:
            return Response(
                {
                    'success': False,
                    'errors': {'message': 'You can only pay for your own bookings'}
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Initiate payment transaction
        txn = PaymentService.initiate_payment(
            booking=booking,
            payment_provider='MOMO',
            metadata={'phone': phone}
        )
        
        # Call MoMo service
        momo_service = MoMoService()
        charge_result = momo_service.charge(
            phone=phone,
            amount=txn.amount,
            reference=str(txn.id),
            description=f"Payment for booking {booking.booking_ref}"
        )
        
        # Process result
        if charge_result['success']:
            # Update transaction as successful
            txn = PaymentService.process_payment_success(
                transaction_id=txn.id,
                provider_ref=charge_result['provider_ref'],
                metadata=charge_result
            )
            
            response_serializer = MoMoChargeResponseSerializer({
                'transaction_id': txn.id,
                'status': 'SUCCESS',
                'message': 'Payment successful',
                'provider_ref': charge_result['provider_ref'],
                'amount': txn.amount,
            })
            
            return Response(
                {
                    'success': True,
                    'data': response_serializer.data
                },
                status=status.HTTP_200_OK
            )
        else:
            # Update transaction as failed
            txn = PaymentService.process_payment_failure(
                transaction_id=txn.id,
                reason=charge_result['message'],
                metadata=charge_result
            )
            
            response_serializer = MoMoChargeResponseSerializer({
                'transaction_id': txn.id,
                'status': 'FAILED',
                'message': charge_result['message'],
                'provider_ref': None,
                'amount': txn.amount,
            })
            
            return Response(
                {
                    'success': False,
                    'data': response_serializer.data,
                    'errors': {'message': charge_result['message']}
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Booking.DoesNotExist:
        return Response(
            {
                'success': False,
                'errors': {'message': 'Booking not found'}
            },
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error processing MoMo charge: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'errors': {'message': str(e)}
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@swagger_auto_schema(
    method='post',
    operation_description="Webhook endpoint for MoMo payment notifications",
    request_body=MoMoWebhookSerializer,
    responses={
        200: "Webhook processed successfully",
        400: "Invalid webhook data"
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])  # Webhooks come from external service
def momo_webhook(request):
    """
    Handle MoMo payment webhook notifications.
    
    Processes payment status updates from MoMo provider.
    Implements idempotency to handle duplicate webhooks.
    """
    # TODO: Verify webhook signature in production
    # signature = request.headers.get('X-MoMo-Signature')
    # momo_service = MoMoService()
    # if not momo_service.verify_webhook_signature(request.body, signature):
    #     return Response({'error': 'Invalid signature'}, status=400)
    
    serializer = MoMoWebhookSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    transaction_ref = serializer.validated_data['transaction_ref']
    webhook_status = serializer.validated_data['status']
    provider_ref = serializer.validated_data.get('provider_ref', '')
    message = serializer.validated_data.get('message', '')
    
    try:
        # Check idempotency
        idempotency_key = f"webhook_{provider_ref}_{transaction_ref}"
        existing_txn = PaymentService.check_idempotency(idempotency_key)
        
        if existing_txn:
            logger.info(f"Duplicate webhook received: {idempotency_key}")
            return Response(
                {
                    'success': True,
                    'message': 'Webhook already processed'
                },
                status=status.HTTP_200_OK
            )
        
        # Find transaction by ID (transaction_ref should be the transaction UUID)
        try:
            transaction_id = uuid.UUID(transaction_ref)
            txn = Transaction.objects.get(id=transaction_id)
        except (ValueError, Transaction.DoesNotExist):
            logger.error(f"Transaction not found: {transaction_ref}")
            return Response(
                {
                    'success': False,
                    'errors': {'message': 'Transaction not found'}
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update idempotency key
        txn.idempotency_key = idempotency_key
        txn.save(update_fields=['idempotency_key'])
        
        # Process based on status
        if webhook_status == 'SUCCESS':
            PaymentService.process_payment_success(
                transaction_id=txn.id,
                provider_ref=provider_ref,
                metadata=serializer.validated_data
            )
            logger.info(f"Webhook processed: Payment successful for {transaction_ref}")
        elif webhook_status == 'FAILED':
            PaymentService.process_payment_failure(
                transaction_id=txn.id,
                reason=message or 'Payment failed',
                metadata=serializer.validated_data
            )
            logger.info(f"Webhook processed: Payment failed for {transaction_ref}")
        
        return Response(
            {
                'success': True,
                'message': 'Webhook processed successfully'
            },
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'errors': {'message': 'Error processing webhook'}
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@swagger_auto_schema(
    method='post',
    operation_description="Manually confirm payment with transaction reference",
    request_body=ManualPaymentConfirmSerializer,
    responses={
        200: TransactionSerializer(),
        400: "Bad request",
        404: "Booking not found"
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_payment_confirm(request):
    """
    Manually confirm payment with transaction reference.
    
    Allows customers to submit payment proof when automatic
    payment processing fails.
    """
    serializer = ManualPaymentConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    booking_id = serializer.validated_data['booking_id']
    transaction_ref = serializer.validated_data['transaction_ref']
    amount = serializer.validated_data['amount']
    payment_method = serializer.validated_data.get('payment_method', 'MOMO')
    notes = serializer.validated_data.get('notes', '')
    
    try:
        # Get booking
        booking = Booking.objects.select_related('customer', 'provider').get(
            id=booking_id
        )
        
        # Verify user is the customer
        if booking.customer != request.user:
            return Response(
                {
                    'success': False,
                    'errors': {'message': 'You can only confirm payment for your own bookings'}
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify amount matches
        if amount != booking.total_amount:
            return Response(
                {
                    'success': False,
                    'errors': {
                        'message': f'Amount mismatch. Expected {booking.total_amount}, got {amount}'
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create manual transaction
        with db_transaction.atomic():
            txn = PaymentService.initiate_payment(
                booking=booking,
                payment_provider='MANUAL',
                metadata={
                    'transaction_ref': transaction_ref,
                    'payment_method': payment_method,
                    'notes': notes,
                    'submitted_by': str(request.user.id),
                }
            )
            
            # Mark as processing (requires admin verification)
            txn.status = 'PROCESSING'
            txn.txn_provider_ref = transaction_ref
            txn.save()
            
            # Update booking
            booking.payment_status = 'AUTHORIZED'
            booking.save(update_fields=['payment_status'])
        
        logger.info(
            f"Manual payment submitted for booking {booking.booking_ref}: "
            f"ref={transaction_ref}"
        )
        
        response_serializer = TransactionSerializer(txn)
        return Response(
            {
                'success': True,
                'data': response_serializer.data,
                'message': 'Payment confirmation submitted. Awaiting admin verification.'
            },
            status=status.HTTP_200_OK
        )
    
    except Booking.DoesNotExist:
        return Response(
            {
                'success': False,
                'errors': {'message': 'Booking not found'}
            },
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error confirming manual payment: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'errors': {'message': str(e)}
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
