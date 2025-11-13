"""URL configuration for admin_dashboard app."""

from django.urls import path

from . import views

app_name = "admin_dashboard"

urlpatterns = [
    # Dashboard statistics
    path("dashboard/stats/", views.dashboard_stats, name="dashboard-stats"),
    # Reports
    path("reports/users/", views.user_statistics, name="user-statistics"),
    path("reports/bookings/", views.booking_statistics, name="booking-statistics"),
    path("reports/transactions/", views.transaction_statistics, name="transaction-statistics"),
    # User management
    path("users/", views.list_users, name="list-users"),
    path("users/<uuid:user_id>/suspend/", views.suspend_user, name="suspend-user"),
    path("users/<uuid:user_id>/activate/", views.activate_user, name="activate-user"),
    # Data export
    path("export/csv/", views.export_csv, name="export-csv"),
]
