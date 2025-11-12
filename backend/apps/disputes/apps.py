"""
Disputes app configuration.
"""

from django.apps import AppConfig


class DisputesConfig(AppConfig):
    """Configuration for the disputes app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.disputes'
    verbose_name = 'Disputes'
