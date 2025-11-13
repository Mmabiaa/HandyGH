"""
Utility functions for HandyGH.

Design Decisions:
- Pure functions for reusability
- No side effects for predictability
- Well-documented for maintainability
"""

import hashlib
import random
import string
from datetime import datetime, timedelta
from math import asin, cos, radians, sin, sqrt
from typing import Tuple


def generate_otp(length=6):
    """
    Generate a random numeric OTP.

    Args:
        length: Length of OTP (default 6)

    Returns:
        String of random digits

    Example:
        >>> otp = generate_otp()
        >>> len(otp)
        6
        >>> otp.isdigit()
        True
    """
    return "".join(random.choices(string.digits, k=length))


def hash_value(value):
    """
    Hash a value using SHA-256.

    Args:
        value: String to hash

    Returns:
        Hexadecimal hash string

    Example:
        >>> hash_value("test")
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    """
    return hashlib.sha256(value.encode()).hexdigest()


def generate_booking_reference():
    """
    Generate a unique booking reference.

    Format: BK_YYYYMMDD_XXXXXX
    Where XXXXXX is random alphanumeric

    Returns:
        Booking reference string

    Example:
        >>> ref = generate_booking_reference()
        >>> ref.startswith('BK_')
        True
    """
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"BK_{date_part}_{random_part}"


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates using Haversine formula.

    Args:
        lat1: Latitude of first point
        lon1: Longitude of first point
        lat2: Latitude of second point
        lon2: Longitude of second point

    Returns:
        Distance in kilometers

    Example:
        >>> # Distance between Accra and Kumasi (approx 200km)
        >>> distance = calculate_distance(5.6037, -0.1870, 6.6885, -1.6244)
        >>> 190 < distance < 210
        True
    """
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))

    # Radius of earth in kilometers
    r = 6371

    return c * r


def normalize_phone_number(phone):
    """
    Normalize phone number to E.164 format (+233XXXXXXXXX).

    Args:
        phone: Phone number in any format

    Returns:
        Normalized phone number

    Example:
        >>> normalize_phone_number("0241234567")
        '+233241234567'
        >>> normalize_phone_number("+233 24 123 4567")
        '+233241234567'
    """
    # Remove spaces, dashes, and parentheses
    cleaned = "".join(c for c in phone if c.isdigit() or c == "+")

    # Convert local format to E.164
    if cleaned.startswith("0"):
        cleaned = "+233" + cleaned[1:]

    return cleaned


def calculate_commission(amount, rate=0.10):
    """
    Calculate platform commission.

    Args:
        amount: Total booking amount
        rate: Commission rate (default 10%)

    Returns:
        Tuple of (commission_amount, provider_amount)

    Example:
        >>> calculate_commission(100, 0.10)
        (10.0, 90.0)
    """
    commission = round(amount * rate, 2)
    provider_amount = round(amount - commission, 2)
    return commission, provider_amount


def is_within_time_window(timestamp, window_days=7):
    """
    Check if timestamp is within specified time window from now.

    Args:
        timestamp: Datetime to check
        window_days: Number of days for the window

    Returns:
        Boolean indicating if within window

    Example:
        >>> from datetime import datetime, timedelta
        >>> recent = datetime.now() - timedelta(days=3)
        >>> is_within_time_window(recent, 7)
        True
        >>> old = datetime.now() - timedelta(days=10)
        >>> is_within_time_window(old, 7)
        False
    """
    if not timestamp:
        return False

    cutoff = datetime.now() - timedelta(days=window_days)
    return timestamp >= cutoff


def format_currency(amount, currency="GHS"):
    """
    Format amount as currency string.

    Args:
        amount: Numeric amount
        currency: Currency code (default GHS)

    Returns:
        Formatted currency string

    Example:
        >>> format_currency(100.50)
        'GHS 100.50'
    """
    return f"{currency} {amount:.2f}"


def paginate_queryset(queryset, page, page_size=20):
    """
    Paginate a queryset.

    Args:
        queryset: Django queryset
        page: Page number (1-indexed)
        page_size: Items per page

    Returns:
        Tuple of (paginated_items, total_pages, total_count)
    """
    total_count = queryset.count()
    total_pages = (total_count + page_size - 1) // page_size

    start = (page - 1) * page_size
    end = start + page_size

    items = queryset[start:end]

    return items, total_pages, total_count
