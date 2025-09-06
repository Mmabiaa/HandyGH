# Software Requirements Specification (SRS) — Gig Marketplace (Full, non-ad hoc)

Below is a complete, engineer-grade SRS for the **Local Services / Gig Marketplace**. It includes functional and non-functional requirements, data model overview, use cases and user stories, acceptance criteria, verification & validation (V\&V) plans, traceability matrices, testing strategy, deployment & CI/CD, security & privacy controls, risk analysis, change control, and sign-off items. Everything is written as **testable, unambiguous requirements** so you (as a solo developer) can implement, verify, and maintain this system using real software engineering practice.

---

# 1. Project Overview

**Name:** Local Services Marketplace (code name: HandyGH)
**Goal:** Provide a trustworthy, mobile-first web platform that connects customers and local service providers (plumbers, electricians, tutors, cleaners, drivers, etc.), supports bookings, payments (MTN MoMo first), rating/reviews, and grows into a scalable platform across markets.
**Primary stakeholders:** Product owner (you), Service Providers, Customers, Admin/Operators, Payment partners, Regulators.
**Target platforms:** Web (mobile-first responsive), later native apps.
**Constraints:** Solo developer; MVP in 1–3 months but SRS assumes full product scope for production readiness.

---

# 2. Definitions / Glossary

* **Provider:** A person/business offering a service (plumber, tutor, etc.).
* **Customer:** User who books a service.
* **Booking:** A scheduled service engagement between customer and provider.
* **Job:** Synonym for booking; can be one-time or recurring.
* **MoMo:** Mobile Money (MTN MoMo initially).
* **KYC:** Know Your Customer, verification processes.
* **Admin:** System operator with visibility over users, transactions, disputes.

---

# 3. Stakeholders & Personas

1. **Ama — Urban Professional (Customer)**

   * Needs fast trusted help, pays via MoMo, expects reviews and quick booking.

2. **Kofi — Independent Electrician (Provider)**

   * Needs visibility, simple onboarding, calendar of availability, fair commissions.

3. **Nana — Small Agency Owner (Provider)**

   * Multiple workers, needs multiple profiles for staff and billing.

4. **Product Owner (You)**

   * Needs analytics, ability to moderate, take commissions, manage disputes.

---

# 4. High Level System Context

* **Frontend (client):** React/Next.js, Mobile-first.
* **Backend (API):** Node.js + Express/Fastify or Django REST; RESTful JSON API.
* **DB:** PostgreSQL (transactional), Redis (optional for caching/queues).
* **Payments:** MTN MoMo API (primary), manual fallback (transaction reference upload).
* **Hosting:** Vercel (front), Railway/Render/AWS/GCP (API + DB).
* **Auth:** JWT access tokens, refresh tokens, OTP via phone (SMS) or email.
* **Monitoring:** Sentry, Prometheus/Datadog (optional).

---

# 5. Functional Requirements (FR) — testable, numbered

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

# 6. Non-Functional Requirements (NFR) — measurable

NFR-1 (P0)—**Performance:** Average API response time SHALL be < 300ms for common endpoints under baseline load (100 concurrent users). Booking creation SHALL complete within 1s under baseline load.
NFR-2 (P0)—**Availability:** System SHALL have 99.5% uptime monthly for API and 99% for UI.
NFR-3 (P0)—**Scalability:** System architecture SHALL support horizontal scaling for API nodes and DB vertical scaling; design for eventual multi-region deployment.
NFR-4 (P0)—**Security:** All traffic SHALL use HTTPS/TLS 1.2+; passwords SHALL be hashed using bcrypt/Argon2; JWT tokens SHALL use strong signing and expirations.
NFR-5 (P0)—**Data retention & privacy:** Personal data SHALL be retained according to configurable policy (default 2 years) and deletable per user request (comply with GDPR-like requests where applicable).
NFR-6 (P0)—**Reliability:** Payment transactions SHALL be ACID-consistent; any money movement SHALL be logged and reconcilable.
NFR-7 (P1)—**Accessibility:** UI SHALL meet WCAG 2.1 AA for core flows (signup, booking).
NFR-8 (P1)—**Maintainability:** Codebase SHALL have ≥70% unit test coverage for business logic and CI checks for linting and tests.
NFR-9 (P1)—**Observability:** System SHALL have basic metrics for CPU, memory, error rates, and Sentry for exceptions.

---

# 7. Use Cases & User Stories (as GIVEN/WHEN/THEN)

### UC-1: Customer books a provider

* GIVEN customer authenticated, searches for "Plumber" within 5km
* WHEN customer selects a provider and requests booking for 2025-10-01 10:00 AM, duration 2 hours, and pays via MoMo
* THEN booking status shall be "Requested", provider gets notification, payment authorisation/logging occurs, and admin sees transaction.

### UC-2: Provider accepts a booking

* GIVEN provider receives request
* WHEN provider clicks "Accept"
* THEN booking status becomes "Confirmed", customer notified, calendar updated.

### UC-3: Provider declines / suggests new time

* GIVEN provider declines
* WHEN provider proposes new time
* THEN system shall create a counter-offer and notify customer; customer may accept or cancel.

### UC-4: Rating & Review

* GIVEN booking is "Completed"
* WHEN customer submits rating 4/5 and review text
* THEN review stores with booking id, visible on provider profile.

### UC-5: Dispute

* GIVEN customer reports issue within 7 days
* WHEN customer uploads photos and requests refund
* THEN admin receives dispute ticket with evidence and can resolve/refund.

(Full list of user stories should be converted into backlog items with JIRA/Trello IDs.)

---

# 8. Data Model (entities & key attributes)

Provide a minimal ERD description (tables and important fields):

* **users** (id, role, name, phone, email, password\_hash, status, created\_at, updated\_at)
* **providers** (id, user\_id fk, business\_name, categories JSON, location (lat, lon), address\_text, verified boolean, verification\_document\_id, rating\_avg, created\_at)
* **provider\_services** (id, provider\_id, title, description, price\_type ENUM(hourly/fixed), price\_amount, duration\_estimate\_min)
* **bookings** (id, customer\_id, provider\_service\_id, provider\_id, address, scheduled\_start, scheduled\_end, status ENUM, total\_amount, commission\_amount, payment\_status, created\_at)
* **transactions** (id, booking\_id, payer\_id, payee\_id, amount, currency, payment\_provider\_txn\_id, status, created\_at)
* **reviews** (id, booking\_id, customer\_id, provider\_id, rating (1–5), comment, created\_at)
* **messages** (id, booking\_id, sender\_id, receiver\_id, body, attachments\_json, created\_at)
* **disputes** (id, booking\_id, raised\_by, reason, evidence\_json, status, resolution, created\_at)

Indexes: users.phone (unique), providers.location (geospatial index), bookings.scheduled\_start, transactions.payment\_provider\_txn\_id.

---

# 9. API Design (selected endpoints, RESTful)

(All endpoints authenticate with JWT except public search/list)

* `POST /api/v1/auth/otp/request` — request OTP
* `POST /api/v1/auth/otp/verify` — verify + issue JWT
* `GET /api/v1/providers?category=plumber&lat=...&lon=...&radius=5` — search providers
* `GET /api/v1/providers/{id}` — provider profile
* `POST /api/v1/bookings` — create booking (body: provider\_service\_id, start, duration, address, payment\_method)
* `PATCH /api/v1/bookings/{id}/accept` — provider accepts
* `PATCH /api/v1/bookings/{id}/status` — update status
* `POST /api/v1/payments/momo/charge` — initiate momo charge
* `POST /api/v1/payments/manual/confirm` — user uploads txn ref
* `GET /api/v1/bookings/{id}/messages` — chat messages
* `POST /api/v1/bookings/{id}/messages` — send chat
* `POST /api/v1/bookings/{id}/reviews` — submit review
* `POST /api/v1/disputes` — open dispute
* `GET /api/v1/admin/reports/transactions?from=&to=` — admin reports

Each endpoint SHOULD include validation rules, rate limiting, and standardized response format:

```json
{
  "success": true,
  "data": {...},
  "errors": null,
  "meta": {...}
}
```

---

# 10. Acceptance Criteria & Test Cases (mapping to FRs)

Below is a mapping table (sample) — for each FR, list verification method and acceptance test.

| FR ID |          Requirement Summary | Verification Type            | Acceptance Test (example)                                                                                  |
| ----- | ---------------------------: | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| FR-1  | Customer registration w/ OTP | Automated tests + manual E2E | POST /auth/otp/request -> receive OTP (mocked) -> /auth/otp/verify returns 200 and JWT; DB has user record |
| FR-7  |               Create booking | Unit + E2E                   | Create booking with valid provider/time -> booking status = Requested; provider notified (mock)            |
| FR-11 |                 MoMo payment | Integration test + manual    | Simulate MoMo API response success -> transaction recorded status=SUCCESS; commission computed             |
| FR-15 |                Ratings saved | Unit + DB test               | After Completed booking, POST /reviews saves rating; provider.avg updated                                  |

**Test cases** must be written for each FR: positive, negative, edge cases (double booking, network failure, invalid payment ref).

---

# 11. Verification & Validation (V\&V) Plan

## V: Verification (are we building the product right?)

* **Code reviews:** Since solo, use pair programming via recorded PRs or structured checklists for major PRs.
* **Static analysis:** ESLint / Prettier; type checking with TypeScript or mypy if Python.
* **Unit tests:** Jest (Node) or Pytest (Python) for business logic; target >=70% coverage on core modules (booking, payments, auth).
* **Integration tests:** Use test containers / staging env to test DB + API flows (bookings, transactions).
* **Contract tests:** For 3rd-party MoMo API, use mock servers and contract tests to ensure expected payloads.

## V: Validation (are we building the right product?)

* **User acceptance testing (UAT):** Recruit 10–20 pilot providers + 30 customers in one Accra neighborhood to exercise all flows: onboarding, booking, payment, review, dispute.
* **Beta feedback loops:** Collect metrics and qualitative feedback; run 2-week sprints to iterate.
* **Acceptance criteria:** Each FR has pass/fail criteria (see Acceptance Criteria above). UAT sign-off requires: 0 critical defects, ≤3 major defects, performance meets baseline.

---

# 12. Testing Strategy (detailed)

* **Automated tests:**

  * Unit tests for all core modules (auth, booking logic, payment accounting).
  * Integration tests for booking→payment→transaction flow.
  * End-to-end tests (Cypress or Playwright) for critical user journeys: signup, search, booking, payment, review.

* **Manual tests:**

  * Exploratory testing for UX in mobile browsers (Chromium on Android, Safari on iPhone).
  * Accessibility audit (axe-core).

* **Load testing:**

  * Use k6 or Locust to simulate 100–1000 concurrent users for baseline; ensure DB connection pools and rate limiting work.

* **Security testing:**

  * OWASP top 10 checks, automated SAST (e.g., GitHub CodeQL), dependency scanning.

* **Regression testing:**

  * CI runs suite on PRs and staging deploys.

---

# 13. Security & Privacy Controls

* **Authentication**: OTP + optional password; strong JWT secrets, refresh tokens with revocation list.
* **Authorization**: RBAC: customer / provider / admin. Permission checks for all sensitive endpoints.
* **Data protection**: Encrypt sensitive fields at rest (PII encryption), use TLS in transit.
* **Secure coding:** Sanitize inputs (prevent SQLi, XSS), limit file upload types and sizes (max 5MB, check mime type), store files in cloud object storage with signed URLs.
* **KYC docs:** Access controlled. Documents should be encrypted and access logged.
* **Payment security:** Do not store full MoMo credentials; store provider payouts tokens securely. Follow payment provider best practices.
* **Rate limiting & anti-fraud:** Limit login attempts, bookings per user; detect suspicious patterns; block repeated failed OTP attempts.
* **Incident response:** Prepare playbook: revoke tokens, notify affected users, restore backups.

---

# 14. Performance & Scalability Approaches

* **Horizontal scaling:** Stateless API servers behind a load balancer; sticky sessions only if necessary.
* **Caching:** Redis for session cache, geospatial provider search cache, and rate limiting.
* **Database:** Use indices for geospatial search (Postgres + PostGIS or simple bounding box for MVP). Partition historic transactions if growth demands.
* **Asynchronous processing:** Use background jobs (BullMQ/Redis or Celery) for notifications, payout processing, heavy image processing.
* **CDN:** Serve static assets & profile images via CDN for speed.

---

# 15. Deployment & CI/CD

* **Branches:** main (production), develop (staging), feature/\* (work).
* **CI Actions (on PR):** Lint -> Typecheck -> Unit tests -> Build -> Integration tests (if quick). PR merge gated on green pipeline and passing code review checklist.
* **CD:** On merge to main, deploy to production environment automatically (with manual approval for major DB migrations). Staging deploys on merge to develop.
* **Backups:** Nightly DB backups with 30-day retention; on-demand snapshot before schema migrations.
* **Rollback:** Automated rollback on failed health checks.

Suggested tools: GitHub Actions / GitLab CI, Docker for consistent env, Terraform/CloudFormation for infra (later).

---

# 16. Monitoring & Observability

* **Error tracking:** Sentry for exceptions.
* **Metrics:** Prometheus + Grafana or DataDog for request rates, latencies, DB metrics, payment failures.
* **Logging:** Centralized structured logs (JSON) to ELK/Cloud provider logs.
* **Alerts:** Pager duty or email alerts for payment failures, high error rates (>1% 5xx), degraded response times.

---

# 17. Legal, Compliance & Business Considerations

* **Terms & Privacy:** Draft T\&Cs and Privacy Policy covering KYC, dispute handling, commission policy, refund policy.
* **Tax & invoicing:** Keep transaction trails; support issuing receipts. Consult local tax rules for service commissions and VAT where applicable.
* **Data residency:** Initially Ghanaian hosting preferred; check regulations for cross-border data transfer before expanding.

---

# 18. Risk Analysis & Mitigation

| Risk                                             | Impact | Likelihood | Mitigation                                                                                                        |
| ------------------------------------------------ | -----: | ---------: | ----------------------------------------------------------------------------------------------------------------- |
| Low provider adoption                            |   High |     Medium | Onboard via field visits, incentives (0% commission for first 30 days), partnerships with local associations      |
| Payment integration delays                       |   High |     Medium | Implement manual confirmation fallback; mock payment flows for testing                                            |
| Fraud / scams                                    |   High |     Medium | KYC, verification badges, ratings, manual review for flagged accounts                                             |
| Solo developer burnout / single point of failure |   High |     Medium | Keep scope realistic; automated tests and infra scripts; document everything; consider contractor for short tasks |
| Regulatory changes                               | Medium |        Low | Monitor regulations, design for modular payment providers, legal counsel when scaling                             |

---

# 19. Requirements Traceability Matrix (sample snippet)

Traceability ensures every requirement maps to design, code modules, and tests.

| Req ID | Source (stakeholder) | Design Doc           |                      API Endpoint | Tests                         |
| ------ | -------------------: | -------------------- | --------------------------------: | ----------------------------- |
| FR-7   |  Customer interviews | Booking Service Spec |             POST /api/v1/bookings | tests/booking\_create.test.js |
| FR-11  |        Product owner | Payments Spec        | POST /api/v1/payments/momo/charge | tests/payment\_momo.test.js   |
| NFR-2  |                  Ops | Deployment doc       |                               N/A | load\_tests/k6\_booking.js    |

(Keep this matrix as a living doc in the repo.)

---

# 20. Acceptance & Sign-off Criteria (for MVP launch)

**MVP Acceptance** — Before production release, ensure:

1. All P0 functional requirements (FR-1 to FR-16) are implemented and have passing automated unit + integration tests.
2. UAT with at least 10 providers and 30 customers completed; critical defects = 0; major defects ≤ 3 and scheduled for fixes.
3. Payment integration with MoMo is functional in sandbox & staging. Manual payment fallback working.
4. Basic monitoring and backups in place.
5. Security checklist passed: OWASP top 10 basic mitigations, SSL, rate limiting.
6. Admin dashboard can view transactions, users, and disputes.
7. Documentation: README, deployment playbook, troubleshooting steps, runbook for common ops tasks.

Sign-off template (simple):

* Product Owner: \_\_\_\_\_\_\_ (date)
* QA Lead: \_\_\_\_\_\_\_ (date)
* DevOps: \_\_\_\_\_\_\_ (date)

(As solo dev, you will sign all roles but record dates and version for accountability.)

---

# 21. Deliverables (what you will produce from SRS → MVP)

* Code repository (branching model + CI)
* Database schema & migration scripts
* API documentation (OpenAPI/Swagger)
* Frontend Next.js app for customers & providers
* Admin dashboard (minimal)
* Payments integration (MoMo + manual fallback)
* Automated tests & test suite results
* UAT report & user feedback log
* Deployment scripts + runbook
* Monitoring dashboard + backups configured
* Legal documents templates (T\&Cs, Privacy)

---

# 22. Implementation Roadmap (detailed weeks)

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

---

# 23. Change Management & Versioning

* All requirement changes MUST be recorded in `CHANGE_REQUESTS.md` with:

  * Requestor, rationale, impact (schedule, cost), approval (Product Owner), and version bump.
* Semantic versioning for releases: MAJOR.MINOR.PATCH. MVP launch = 1.0.0.

---

# 24. Documentation & Developer Onboarding

* **README.md**: setup dev env, run tests, run migrations.
* **API docs**: Swagger/OpenAPI auto-generated; publish on `/api/docs`.
* **Runbook**: quick steps to restart services, restore DB from backup, payout process.
* **Onboarding doc**: how to add providers manually, verify KYC, issue refunds.

---

# 25. Final Notes — Practical Tips for Solo Execution

1. **Automate everything**: dev environment setup (Docker), migrations, tests, deployment scripts. This reduces human error and overhead.
2. **Start hyperlocal**: pick one suburb in Accra and 1–2 service categories to reduce complexity and speed onboarding.
3. **Use third-party SaaS where it cuts time**: Auth0 (if you want), SendGrid for email, Twilio for SMS (or local SMS provider), and a MoMo SDK. But avoid vendor lock for core payment flows.
4. **Instrument early**: track key metrics from day one — signups, bookings, successful payments, conversion, churn. These guide product decisions.
5. **Document decisions**: every architectural decision should have a short rationale and alternatives considered.

---
