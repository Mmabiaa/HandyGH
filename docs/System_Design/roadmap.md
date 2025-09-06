#  Implementation Roadmap (detailed weeks)

**Week 0 — Preliminaries**

* Finalize SRS (this document), choose stack, set up repository, CI.

**Week 1 — Core infra & Auth**

* DB schema, migrations scaffold.
* Auth + OTP flows, user models, basic UI pages (signup/login).
* Setup CI, linting, unit test harness.

**Week 2 — Provider Profiles & Search**

* Provider onboarding forms, profile CRUD.
* Geolocation & search (category + radius).
* Basic UI for provider listing.

**Week 3 — Booking Flow**

* Booking API, provider availability toggle, calendar basics.
* Booking notifications (email/SMS mocked).
* Concurrency checks to prevent double bookings.

**Week 4 — Payments (MoMo sandbox)**

* Integrate MoMo sandbox for charge & webhook handling.
* Transaction accounting, commission calculation.
* Manual payment reference flow as fallback.

**Week 5 — Messaging & Reviews**

* In-app chat per booking (simple), store history.
* Ratings & reviews, provider rating aggregation.

**Week 6 — Admin Dashboard & Disputes**

* Admin views for users, bookings, transactions, dispute management.
* CSV exports and basic analytics.

**Week 7 — Testing & Hardening**

* Unit & integration tests coverage, security checks.
* Load tests, fix bottlenecks.

**Week 8 — UAT & Beta**

* Deploy staging, onboard pilot users, collect feedback.
* Fix critical issues, polish UX.

**Week 9 — Prepare Production**

* Final performance tuning, backup plan, finalize legal texts.

**Week 10 — MVP Launch**

* Deploy production, observe initial metrics, start marketing/onboarding.

(You can compress timeline to 6–8 weeks with focused work and by limiting initial categories to 1–2.)
