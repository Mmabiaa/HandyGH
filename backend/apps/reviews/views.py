"""
API views for reviews app.

Design Decisions:
- RESTful API design with proper HTTP methods
- Permission-based access control
- Pagination for list endpoints
- Comprehensive error handling

SOLID Principles:
- Single Responsibility: Each view handles specific endpoint
- Dependency Inversion: Views depend on service abstractions
"""

import logging

from django.core.exceptions import ValidationError

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsCustomer

from .models import Review
from .serializers import CreateReviewSerializer, ProviderRatingStatsSerializer, ReviewSerializer
from .services import RatingAggregationService, ReviewService

logger = logging.getLogger(__name__)


class CreateReviewView(APIView):
    """
    Create a review for a completed booking.

    POST /api/v1/bookings/{booking_id}/reviews/
    """

    permission_classes = [IsAuthenticated, IsCustomer]

    @swagger_auto_schema(
        operation_description="Submit a review for a completed booking",
        request_body=CreateReviewSerializer,
        responses={
            201: ReviewSerializer,
            400: "Bad Request - Validation error",
            403: "Forbidden - Not authorized",
            404: "Not Found - Booking not found",
        },
        tags=["Reviews"],
    )
    def post(self, request, booking_id):
        """Create a review for a booking."""
        serializer = CreateReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            review = ReviewService.create_review(
                booking_id=booking_id,
                customer=request.user,
                rating=serializer.validated_data["rating"],
                comment=serializer.validated_data.get("comment", ""),
            )

            response_serializer = ReviewSerializer(review)

            return Response(
                {
                    "success": True,
                    "data": response_serializer.data,
                    "message": "Review submitted successfully",
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            return Response(
                {
                    "success": False,
                    "errors": {"detail": str(e)},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Error creating review: {str(e)}", exc_info=True)
            return Response(
                {
                    "success": False,
                    "errors": {"detail": "Failed to create review"},
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ProviderReviewsListView(generics.ListAPIView):
    """
    Get reviews for a provider.

    GET /api/v1/providers/{provider_id}/reviews/
    """

    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get reviews for the specified provider."""
        provider_id = self.kwargs["provider_id"]
        return ReviewService.get_provider_reviews(provider_id)

    @swagger_auto_schema(
        operation_description="Get all reviews for a provider with pagination",
        responses={
            200: ReviewSerializer(many=True),
            404: "Not Found - Provider not found",
        },
        tags=["Reviews"],
    )
    def get(self, request, *args, **kwargs):
        """List provider reviews."""
        return super().get(request, *args, **kwargs)


class ReviewDetailView(APIView):
    """
    Get review details.

    GET /api/v1/reviews/{review_id}/
    """

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get details of a specific review",
        responses={
            200: ReviewSerializer,
            404: "Not Found - Review not found",
        },
        tags=["Reviews"],
    )
    def get(self, request, review_id):
        """Get review by ID."""
        try:
            review = ReviewService.get_review_by_id(review_id)
            serializer = ReviewSerializer(review)

            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except Review.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "errors": {"detail": "Review not found"},
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Error fetching review: {str(e)}", exc_info=True)
            return Response(
                {
                    "success": False,
                    "errors": {"detail": "Failed to fetch review"},
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ProviderRatingStatsView(APIView):
    """
    Get provider rating statistics.

    GET /api/v1/providers/{provider_id}/rating-stats/
    """

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get detailed rating statistics for a provider",
        responses={
            200: ProviderRatingStatsSerializer,
            404: "Not Found - Provider not found",
        },
        tags=["Reviews"],
    )
    def get(self, request, provider_id):
        """Get provider rating statistics."""
        try:
            stats = RatingAggregationService.get_provider_rating_stats(provider_id)
            serializer = ProviderRatingStatsSerializer(stats)

            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            return Response(
                {
                    "success": False,
                    "errors": {"detail": str(e)},
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Error fetching rating stats: {str(e)}", exc_info=True)
            return Response(
                {
                    "success": False,
                    "errors": {"detail": "Failed to fetch rating statistics"},
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
