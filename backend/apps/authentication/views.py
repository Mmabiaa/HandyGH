"""
Views for authentication app.

Design Decisions:
- APIView for custom authentication endpoints
- Standardized response format
- Comprehensive error handling
- Rate limiting via DRF throttling
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import (
    OTPRequestSerializer,
    OTPVerifySerializer,
    TokenRefreshSerializer,
    LogoutSerializer
)
from .services import OTPService, JWTService
from core.exceptions import (
    ValidationError,
    AuthenticationError,
    RateLimitError
)


class OTPRequestView(APIView):
    """
    Request OTP for phone number.
    
    Generates and sends OTP code via SMS.
    Rate limited to prevent abuse.
    """
    
    permission_classes = [AllowAny]
    throttle_scope = 'otp_request'
    
    @swagger_auto_schema(
        operation_description="Request OTP code for phone number",
        request_body=OTPRequestSerializer,
        responses={
            200: openapi.Response(
                description="OTP sent successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "data": {
                            "message": "OTP sent successfully",
                            "expires_in_minutes": 10
                        },
                        "meta": {}
                    }
                }
            ),
            400: "Invalid phone number",
            429: "Rate limit exceeded"
        }
    )
    def post(self, request):
        """
        Handle OTP request.
        
        Args:
            request: HTTP request with phone number
            
        Returns:
            Response with success status
        """
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = OTPService.request_otp(
                phone=serializer.validated_data['phone']
            )
            
            return Response({
                'success': True,
                'data': result,
                'meta': {}
            }, status=status.HTTP_200_OK)
            
        except RateLimitError as e:
            return Response({
                'success': False,
                'errors': {
                    'message': str(e),
                    'code': 'RATE_LIMIT_EXCEEDED'
                },
                'meta': {}
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        except Exception as e:
            return Response({
                'success': False,
                'errors': {
                    'message': 'Failed to send OTP',
                    'code': 'OTP_SEND_FAILED'
                },
                'meta': {}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OTPVerifyView(APIView):
    """
    Verify OTP and issue JWT tokens.
    
    Validates OTP code and returns access and refresh tokens.
    """
    
    permission_classes = [AllowAny]
    throttle_scope = 'otp_verify'
    
    @swagger_auto_schema(
        operation_description="Verify OTP code and receive JWT tokens",
        request_body=OTPVerifySerializer,
        responses={
            200: openapi.Response(
                description="OTP verified successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "data": {
                            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                            "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                            "token_type": "Bearer",
                            "expires_in": 900,
                            "user": {
                                "id": "uuid",
                                "phone": "+233241234567",
                                "name": "John Doe",
                                "role": "CUSTOMER"
                            }
                        },
                        "meta": {}
                    }
                }
            ),
            400: "Invalid OTP",
            401: "OTP expired or invalid",
            429: "Too many attempts"
        }
    )
    def post(self, request):
        """
        Handle OTP verification.
        
        Args:
            request: HTTP request with phone and OTP
            
        Returns:
            Response with JWT tokens
        """
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Verify OTP
            user = OTPService.verify_otp(
                phone=serializer.validated_data['phone'],
                otp_code=serializer.validated_data['otp']
            )
            
            # Create JWT tokens
            tokens = JWTService.create_tokens(user, request)
            
            return Response({
                'success': True,
                'data': tokens,
                'meta': {}
            }, status=status.HTTP_200_OK)
            
        except AuthenticationError as e:
            return Response({
                'success': False,
                'errors': {
                    'message': str(e),
                    'code': 'AUTHENTICATION_FAILED'
                },
                'meta': {}
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        except RateLimitError as e:
            return Response({
                'success': False,
                'errors': {
                    'message': str(e),
                    'code': 'RATE_LIMIT_EXCEEDED'
                },
                'meta': {}
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)


class TokenRefreshView(APIView):
    """
    Refresh access token using refresh token.
    
    Exchanges refresh token for new access and refresh tokens.
    """
    
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_description="Refresh access token",
        request_body=TokenRefreshSerializer,
        responses={
            200: openapi.Response(
                description="Token refreshed successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "data": {
                            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                            "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                            "token_type": "Bearer",
                            "expires_in": 900
                        },
                        "meta": {}
                    }
                }
            ),
            401: "Invalid or expired refresh token"
        }
    )
    def post(self, request):
        """
        Handle token refresh.
        
        Args:
            request: HTTP request with refresh token
            
        Returns:
            Response with new tokens
        """
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            tokens = JWTService.refresh_tokens(
                refresh_token_str=serializer.validated_data['refresh_token'],
                request=request
            )
            
            return Response({
                'success': True,
                'data': tokens,
                'meta': {}
            }, status=status.HTTP_200_OK)
            
        except AuthenticationError as e:
            return Response({
                'success': False,
                'errors': {
                    'message': str(e),
                    'code': 'AUTHENTICATION_FAILED'
                },
                'meta': {}
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    Logout user by revoking refresh token.
    
    Revokes the provided refresh token.
    """
    
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Logout by revoking refresh token",
        request_body=LogoutSerializer,
        responses={
            200: openapi.Response(
                description="Logged out successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "data": {
                            "message": "Logged out successfully"
                        },
                        "meta": {}
                    }
                }
            )
        }
    )
    def post(self, request):
        """
        Handle logout.
        
        Args:
            request: HTTP request with refresh token
            
        Returns:
            Response with success status
        """
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        JWTService.revoke_token(
            refresh_token_str=serializer.validated_data['refresh_token']
        )
        
        return Response({
            'success': True,
            'data': {
                'message': 'Logged out successfully'
            },
            'meta': {}
        }, status=status.HTTP_200_OK)


class LogoutAllView(APIView):
    """
    Logout from all devices by revoking all refresh tokens.
    
    Revokes all refresh tokens for the authenticated user.
    """
    
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Logout from all devices",
        responses={
            200: openapi.Response(
                description="Logged out from all devices",
                examples={
                    "application/json": {
                        "success": True,
                        "data": {
                            "message": "Logged out from all devices",
                            "tokens_revoked": 3
                        },
                        "meta": {}
                    }
                }
            )
        }
    )
    def post(self, request):
        """
        Handle logout from all devices.
        
        Args:
            request: HTTP request
            
        Returns:
            Response with number of tokens revoked
        """
        count = JWTService.revoke_all_tokens(request.user)
        
        return Response({
            'success': True,
            'data': {
                'message': 'Logged out from all devices',
                'tokens_revoked': count
            },
            'meta': {}
        }, status=status.HTTP_200_OK)
