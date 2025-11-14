"""
Management command to clean up expired PendingUser records.

This command should be run periodically (e.g., via cron job or scheduler)
to remove expired pending user records from the database.

Usage:
    python manage.py cleanup_pending_users
    python manage.py cleanup_pending_users --dry-run
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.authentication.models import PendingUser


class Command(BaseCommand):
    """
    Delete expired PendingUser records.

    Removes all pending user records that have passed their expiration time.
    This prevents database clutter from incomplete signups.
    """

    help = "Delete expired PendingUser records from the database"

    def add_arguments(self, parser):
        """Add command arguments."""
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be deleted without actually deleting",
        )

    def handle(self, *args, **options):
        """Execute the command."""
        dry_run = options["dry_run"]

        # Get expired pending users
        expired_users = PendingUser.objects.filter(expires_at__lt=timezone.now())
        count = expired_users.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("No expired pending users found."))
            return

        if dry_run:
            self.stdout.write(
                self.style.WARNING(f"DRY RUN: Would delete {count} expired pending users:")
            )
            for user in expired_users[:10]:  # Show first 10
                self.stdout.write(f"  - {user.name} ({user.phone}) - expired at {user.expires_at}")
            if count > 10:
                self.stdout.write(f"  ... and {count - 10} more")
        else:
            # Actually delete
            deleted_count, _ = expired_users.delete()

            self.stdout.write(
                self.style.SUCCESS(f"Successfully deleted {deleted_count} expired pending users")
            )

            # Log some statistics
            remaining = PendingUser.objects.count()
            self.stdout.write(f"Remaining pending users: {remaining}")
