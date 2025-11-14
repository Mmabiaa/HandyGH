# Provider Features

This directory contains all provider-specific features and screens for the HandyGH mobile application.

## Overview

The provider features enable service providers to manage their business, view metrics, handle booking requests, and track earnings.

## Components

### MetricCard
Displays a single business metric with icon and value. Used in the dashboard to show key performance indicators.

### EarningsChart
Visualizes earnings trend over the past 30 days with a line chart.

### UpcomingBookingCard
Displays a single upcoming booking with customer info, service details, and timing.

## Screens

### ProviderDashboardScreen
Main dashboard for providers showing:
- Key business metrics (earnings, bookings, rating)
- Earnings trend chart (30 days)
- Upcoming bookings preview
- Quick action buttons
- Pull-to-refresh functionality

**Requirements**: 8.1, 8.2, 8.3, 8.4, 8.12

## Data Fetching

Dashboard data is fetched using React Query hooks from `useDashboard.ts`:
- `useDashboardData()` - Complete dashboard data
- `useDashboardMetrics()` - Metrics only
- `useEarningsTrend(days)` - Earnings trend
- `useUpcomingBookings(days)` - Upcoming bookings

## Implementation Status

- [x] ProviderDashboardScreen - Complete
- [ ] BookingRequestsScreen - Pending
- [ ] ProviderCalendarScreen - Pending
- [ ] EarningsScreen - Pending
- [ ] ServiceExecutionScreen - Pending
