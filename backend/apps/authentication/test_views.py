"""
Test views for development only.

These endpoints should NEVER be enabled in production!
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from .models import OTPToken
from core.utils import hash_value


class GetLastOTPView(APIView):
    """
    Development-only endpoint to retrieve the last OTP for a phone number.
    
    WARNING: This should NEVER be enabled in production!
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get last OTP for testing."""
        if not settings.DEBUG:
            return Response({
                'success': False,
                'errors': {
                    'message': 'This endpoint is only available in development mode',
                    'code': 'NOT_AVAILABLE'
                }
            }, status=403)
        
        phone = request.query_params.get('phone')
        if not phone:
            return Response({
                'success': False,
                'errors': {
                    'message': 'Phone number is required',
                    'code': 'MISSING_PHONE'
                }
            }, status=400)
        
        # Get the last OTP token for this phone
        try:
            otp_token = OTPToken.objects.filter(
                phone=phone,
                verified=False
            ).latest('created_at')
            
            return Response({
                'success': True,
                'data': {
                    'phone': phone,
                    'otp_hash': otp_token.code_hash,
                    'expires_at': otp_token.expires_at,
                    'attempts': otp_token.attempts,
                    'note': 'Check server console for actual OTP code'
                },
                'meta': {}
            })
        except OTPToken.DoesNotExist:
            return Response({
                'success': False,
                'errors': {
                    'message': 'No OTP found for this phone number',
                    'code': 'OTP_NOT_FOUND'
                }
            }, status=404)
