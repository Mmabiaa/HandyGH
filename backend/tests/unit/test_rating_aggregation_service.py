"""
Unit tests for RatingAggregationService.

Tests rating calculation and aggregation logic.
"""

from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.utils import timezone

import pytest

from apps.bookings.models import Booking
from apps.reviews.services import RatingAggregationService, ReviewService


@pytest.mark.django_db
class TestRatingAggregationService:
    """Test RatingAggregationService functionality."""

    def test_update_provider_rating_single_review(self, customer, provider, booking):
        """Test provider rating update with single review."""
        booking.status = "COMPLETED"
        booking.save()

        # Create review
        ReviewService.create_review(
            booking_id=str(booking.id), customer=customer, rating=4, comment="Good service"
        )

        # Check provider rating
        provider.refresh_from_db()
        assert provider.rating_avg == Decimal("4.00")
        assert provider.rating_count == 1

    def test_update_provider_rating_multiple_reviews(self, customer, provider, booking):
        """Test provider rating update with multiple reviews."""
        # Create first review
        booking.status = "COMPLETED"
        booking.save()

        ReviewService.create_review(
            booking_id=str(booking.id), customer=customer, rating=5, comment="Excellent"
        )

        # Create second booking and review
        booking2 = Booking.objects.create(
            booking_ref="BK-TEST789",
            customer=customer,
            provider=provider,
            provider_service=booking.provider_service,
            status="COMPLETED",
            scheduled_start=timezone.now() + timedelta(days=3),
            scheduled_end=timezone.now() + timedelta(days=3, hours=2),
            address="789 Test Street",
            total_amount=Decimal("200.00"),
            payment_status="PAID",
        )

        ReviewService.create_review(
            booking_id=str(booking2.id), customer=customer, rating=3, comment="Average"
        )

        # Check provider rating (average of 5 and 3 = 4.00)
        provider.refresh_from_db()
        assert provider.rating_avg == Decimal("4.00")
        assert provider.rating_count == 2

    def test_update_provider_rating_no_reviews(self, provider):
        """Test provider rating update with no reviews."""
        result = RatingAggregationService.update_provider_rating(str(provider.id))

        assert result["rating_avg"] == 0.00
        assert result["rating_count"] == 0

        provider.refresh_from_db()
        assert provider.rating_avg == Decimal("0.00")
        assert provider.rating_count == 0

    def test_update_provider_rating_provider_not_found(self):
        """Test rating update for non-existent provider."""
        with pytest.raises(ValidationError) as exc_info:
            RatingAggregationService.update_provider_rating("00000000-0000-0000-0000-000000000000")

        assert "Provider not found" in str(exc_info.value)

    def test_get_provider_rating_stats(self, customer, provider, booking):
        """Test getting provider rating statistics."""
        # Create multiple reviews with different ratings
        booking.status = "COMPLETED"
        booking.save()

        ReviewService.create_review(
            booking_id=str(booking.id), customer=customer, rating=5, comment="Excellent"
        )

        # Create more bookings and reviews
        for i, rating in enumerate([4, 5, 3, 5], start=1):
            new_booking = Booking.objects.create(
                booking_ref=f"BK-STATS{i}",
                customer=customer,
                provider=provider,
                provider_service=booking.provider_service,
                status="COMPLETED",
                scheduled_start=timezone.now() + timedelta(days=i),
                scheduled_end=timezone.now() + timedelta(days=i, hours=2),
                address=f"{i} Stats Street",
                total_amount=Decimal("100.00"),
                payment_status="PAID",
            )

            ReviewService.create_review(
                booking_id=str(new_booking.id),
                customer=customer,
                rating=rating,
                comment=f"Review {i}",
            )

        # Get stats
        stats = RatingAggregationService.get_provider_rating_stats(str(provider.id))

        assert stats["rating_count"] == 5
        assert stats["rating_avg"] == 4.4  # (5+4+5+3+5)/5 = 4.4

        # Check distribution
        distribution = stats["rating_distribution"]
        assert distribution["5"] == 3
        assert distribution["4"] == 1
        assert distribution["3"] == 1
        assert distribution["2"] == 0
        assert distribution["1"] == 0

    def test_get_provider_rating_stats_no_reviews(self, provider):
        """Test getting stats for provider with no reviews."""
        stats = RatingAggregationService.get_provider_rating_stats(str(provider.id))

        assert stats["rating_avg"] == 0.00
        assert stats["rating_count"] == 0
        assert all(count == 0 for count in stats["rating_distribution"].values())

    def test_get_provider_rating_stats_provider_not_found(self):
        """Test getting stats for non-existent provider."""
        with pytest.raises(ValidationError) as exc_info:
            RatingAggregationService.get_provider_rating_stats(
                "00000000-0000-0000-0000-000000000000"
            )

        assert "Provider not found" in str(exc_info.value)

    def test_rating_precision(self, customer, provider, booking):
        """Test rating calculation precision."""
        # Create reviews that result in non-round average
        booking.status = "COMPLETED"
        booking.save()

        ReviewService.create_review(
            booking_id=str(booking.id), customer=customer, rating=5, comment="Review 1"
        )

        booking2 = Booking.objects.create(
            booking_ref="BK-PREC1",
            customer=customer,
            provider=provider,
            provider_service=booking.provider_service,
            status="COMPLETED",
            scheduled_start=timezone.now() + timedelta(days=1),
            scheduled_end=timezone.now() + timedelta(days=1, hours=2),
            address="Precision Street",
            total_amount=Decimal("100.00"),
            payment_status="PAID",
        )

        ReviewService.create_review(
            booking_id=str(booking2.id), customer=customer, rating=4, comment="Review 2"
        )

        booking3 = Booking.objects.create(
            booking_ref="BK-PREC2",
            customer=customer,
            provider=provider,
            provider_service=booking.provider_service,
            status="COMPLETED",
            scheduled_start=timezone.now() + timedelta(days=2),
            scheduled_end=timezone.now() + timedelta(days=2, hours=2),
            address="Precision Street 2",
            total_amount=Decimal("100.00"),
            payment_status="PAID",
        )

        ReviewService.create_review(
            booking_id=str(booking3.id), customer=customer, rating=4, comment="Review 3"
        )

        # Average should be (5+4+4)/3 = 4.33 (rounded to 2 decimals)
        provider.refresh_from_db()
        assert provider.rating_avg == Decimal("4.33")
        assert provider.rating_count == 3
