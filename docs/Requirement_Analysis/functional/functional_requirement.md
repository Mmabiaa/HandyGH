# Functional Requirements (FR) — testable, numbered

> Priority levels: P0 (must), P1 (important), P2 (nice-to-have)

## User & Account Management

FR-1 (P0): The system SHALL provide customer registration via phone number and/or email with OTP verification.
FR-2 (P0): The system SHALL provide provider registration with profile fields: full name, business name (optional), categories, services offered, price model (hourly/fixed), primary location (GPS/address), contact phone, profile photo, ID document upload (for verification).
FR-3 (P0): The system SHALL support role-based authentication (customer, provider, admin).
FR-4 (P1): The system SHALL support provider multi-worker accounts (agency mode) enabling managers to add workers.

## Provider Discovery & Listings

FR-5 (P0): The system SHALL allow customers to search and filter providers by category, location (radius), price range, rating, availability, and verified badge.
FR-6 (P0): The system SHALL display provider profiles containing ratings, reviews, sample work photos, rates, languages, and response time metrics.

## Booking & Scheduling

FR-7 (P0): The system SHALL allow customers to create a booking specifying provider, date, start time, estimated duration, location, and job notes.
FR-8 (P0): The system SHALL allow providers to accept, decline, or propose a new time for a booking.
FR-9 (P0): The system SHALL update booking status (Requested → Confirmed → In Progress → Completed → Cancelled → Disputed).
FR-10 (P1): The system SHALL support recurring bookings (e.g., weekly cleaning).

## Payments & Commissions

FR-11 (P0): The system SHALL allow customers to pay for bookings using MTN MoMo via API integration.
FR-12 (P0): The system SHALL record payment transactions and support reconciliations; it SHALL hold provider payouts until settlement (configurable).
FR-13 (P0): The system SHALL deduct the platform commission (configurable % or flat fee) from every successful booking.
FR-14 (P1): The system SHALL support manual payment confirmation (customer uploads MoMo transaction reference) if API integration fails.

## Ratings, Reviews & Trust

FR-15 (P0): The system SHALL allow customers to rate and leave reviews for completed bookings; reviews SHALL be timestamped and associated with booking IDs.
FR-16 (P1): The system SHALL support provider verification badges after admin KYC checks.
FR-17 (P1): The system SHALL support photo evidence upload for dispute resolution.

## Messaging & Notifications

FR-18 (P0): The system SHALL support in-app chat between customer and provider (message history tied to booking).
FR-19 (P0): The system SHALL send notifications: booking created, booking confirmed/declined, upcoming booking reminder (configurable times), payment success/failure, booking completed. Notifications SHALL be delivered via push (if applicable), email, and SMS (OTP & critical alerts).

## Admin & Moderation

FR-20 (P0): The system SHALL provide admin dashboard: user management, listing moderation, view transactions, dispute handling, configure commissions, and reports.
FR-21 (P1): Admin SHALL be able to suspend/ban users and manually adjust transactions/refunds.

## Disputes & Refunds

FR-22 (P0): The system SHALL allow customers and providers to raise disputes against a booking within a configurable time window (e.g., 7 days).
FR-23 (P1): The system SHALL have a dispute workflow: submit evidence, admin review, resolution (refund/partial refund/provider penalty).

## Audit & Logging

FR-24 (P0): The system SHALL log all critical actions (logins, bookings, payments, disputes, refunds) with user ID, timestamp, and actor. Logs SHALL be tamper-evident for audit.

## Internationalization & Localization

FR-25 (P1): The system SHALL support localization (currency, date/time, languages). Ghana initial locale: en-GH and Twi/Pidgin UI support later.

## Data Export & Reports

FR-26 (P1): The system SHALL allow admin to export CSV reports for transactions, bookings, users for a selectable date range.

---