# System Design Document (Comprehensive) — HandyGH (Local Services / Gig Marketplace)

This System Design Document (SDD) is a complete, engineer-grade blueprint for building the HandyGH web platform from SRS → production. It includes architecture, data model, detailed API contracts, sequence flows, database schemas (DDL), security, scaling, CI/CD, testing, monitoring, deployment, operational runbooks, and readiness checklists. Everything is written to be actionable and testable so you — as a solo developer — can implement with minimal guesswork.

> Audience: solo developer (you), future engineers, QA, and operations.

---

# 1. Design Goals & Constraints (recap)

* Mobile-first web app for Ghana with MoMo payments.
* Solo-developer implementable; robust, secure, and production-ready.
* Modular, testable codebase; CI/CD-driven.
* MVP scope prioritized but designed for scale.
* Tech choices: Next.js (frontend), Node.js + TypeScript (backend) or Django + Python (if preferred). Below examples use Node.js + TypeScript.

---

# 2. High-Level Architecture (HLD)

## 2.1 Components

* **Client (Web)**: Next.js app (SSR where beneficial), responsive UI, service pages, booking flows.
* **API Server**: Node.js + TypeScript, Express/Fastify, RESTful endpoints (OpenAPI).
* **Database**: PostgreSQL (primary), PostGIS extension optional for geospatial.
* **Cache/Queue**: Redis (caching, rate limiting, job queue with BullMQ).
* **Background Workers**: Node worker(s) for async tasks: notifications, image processing, payout jobs.
* **File Storage**: S3-compatible (AWS S3 / Cloudflare R2 / DigitalOcean Spaces) for images and docs.
* **Payments**: MTN MoMo integration (sandbox → production) + manual-payment fallback endpoint.
* **Auth/Identity**: OTP via SMS (local SMS provider) and JWT tokens; refresh tokens persisted in DB.
* **Admin UI**: Minimal separate Next.js admin panel with RBAC.
* **Monitoring & Logging**: Sentry (errors), Prometheus/Grafana (metrics), ELK or hosted logs.
* **CI/CD**: GitHub Actions for tests and deployments.

## 2.2 Deployment Topology

* Frontend deployed on Vercel (fast for Next.js).
* Backend containers on Render/Railway/Fly.io or AWS ECS Fargate.
* PostgreSQL managed instance (Supabase, RDS).
* Redis managed (Upstash, Redis Cloud).
* Object storage in same region as DB.
* Use a CDN for static assets and images.

(See Deployment diagram in Section 11 — textual rendering below.)

---

# 3. Detailed Module Breakdown (LLD)

## 3.1 Modules / Services

* **Auth Service**

  * OTP request/verify, JWT issue/refresh/revoke, password reset, role assignment.
* **User/Profile Service**

  * Customer & Provider profile CRUD, provider verification, agency mode.
* **Search Service**

  * Category filter, location radius search, sort by rating/price.
* **Booking Service**

  * Booking creation, availability checks, state transitions, calendar sync.
* **Payment Service**

  * Initiate MoMo charge, handle webhooks, reconciliation, commission calc.
* **Messaging Service**

  * Per-booking chat, attachments, retention policy.
* **Review Service**

  * Save ratings/reviews, aggregate provider rating.
* **Admin Service**

  * Reports, user moderation, dispute resolution.
* **Notification Service**

  * Email, SMS, in-app notifications; background job processing.
* **Audit & Logging Service**

  * Centralized action logs, payment ledgers, tamper-evident storage.

## 3.2 Key Libraries & Patterns

* TypeScript for type safety.
* ORM: Prisma (TypeScript) or TypeORM / Sequelize.
* Background queue: BullMQ (Redis).
* Validation: Zod or Joi.
* Testing: Jest (unit), Playwright/Cypress (E2E).
* Linter: ESLint + Prettier.
* Secrets: Vault or provider secret manager.

---

# 4. Database Design & DDL

## 4.1 ERD (textual)

* users (id PK) ← one-to-one → providers (provider\_id PK, user\_id FK)
* providers → provider\_services (1-to-many)
* provider\_services → bookings (1-to-many)
* bookings → transactions (1-to-many)
* bookings → messages (1-to-many)
* bookings → reviews (1-to-one after complete)
* disputes → bookings

## 4.2 Schema (Postgres SQL — essential tables)

```sql
-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('customer','provider','admin')),
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- providers
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  categories TEXT[],    -- e.g. ['plumbing','electrical']
  location GEOGRAPHY(POINT, 4326), -- PostGIS (lat,lon)
  address TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_doc_url TEXT,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- provider_services
CREATE TABLE provider_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  price_type TEXT CHECK (price_type IN ('hourly','fixed')),
  price_amount NUMERIC(12,2) NOT NULL,
  duration_minutes INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT UNIQUE,
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  provider_service_id UUID REFERENCES provider_services(id),
  status TEXT CHECK (status IN ('requested','confirmed','in_progress','completed','cancelled','disputed')) DEFAULT 'requested',
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  address TEXT,
  total_amount NUMERIC(12,2),
  commission_amount NUMERIC(12,2),
  payment_status TEXT CHECK (payment_status IN ('pending','paid','failed','refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  txn_provider VARCHAR(255), -- e.g., momo_txn_id
  payer_id UUID,
  payee_id UUID,
  amount NUMERIC(12,2),
  currency VARCHAR(10) DEFAULT 'GHS',
  status TEXT CHECK (status IN ('initiated','success','failed','refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Notes:

* Use `gen_random_uuid()` from `pgcrypto` extension or `uuid_generate_v4()` from `uuid-ossp`.
* Add indices for geospatial queries and common lookups: `CREATE INDEX ON providers USING GIST(location);`, index on `bookings.scheduled_start`.

---

# 5. API Specification (OpenAPI-style summaries + sample payloads)

All endpoints return:

```json
{ "success": true|false, "data": {...}, "errors": {...}, "meta": {...} }
```

### Auth

* `POST /api/v1/auth/otp/request`
  Body: `{ "phone": "+233xx" }`
  Response: `{ "success": true, "data": { "otp_sent": true } }`

* `POST /api/v1/auth/otp/verify`
  Body: `{ "phone": "+233xx", "otp": "123456" }`
  Response: `{ "data": { "access_token": "jwt...", "refresh_token": "r_jwt" } }`

### Providers

* `POST /api/v1/providers` — create provider profile
  Auth: provider JWT
  Body: `{ "business_name":"Kofi Plumbing", "categories":["plumbing"], "address":"Accra", "lat":5.6, "lon":-0.2 }`

* `GET /api/v1/providers?category=plumbing&lat=5.6037&lon=-0.1870&radius=5` — search
  Response: list of provider summaries with distance & avg rating.

### Bookings

* `POST /api/v1/bookings`
  Auth: customer
  Body:

  ```json
  {
    "provider_service_id": "uuid",
    "scheduled_start": "2025-10-01T10:00:00Z",
    "estimated_duration_min": 120,
    "address": "House 45, Accra",
    "payment_method": "momo"
  }
  ```

  Response: booking object with status "requested".

* `PATCH /api/v1/bookings/{id}/accept` — provider accepts
  Body: `{}`

* `PATCH /api/v1/bookings/{id}/status` — change status (validate transitions)

### Payments

* `POST /api/v1/payments/momo/charge` — initiate payment
  Body: `{ "booking_id": "uuid", "phone": "+233xx" }`
  Response: `{ "provider_payload": { ... } }` or status indicating next steps (polling or webhook).

* `POST /api/v1/payments/webhook/momo` — webhook (MTN posts here)
  Body: provider-specified; handle idempotency.

* `POST /api/v1/payments/manual/confirm` — manual ref (fallback)
  Body: `{ "booking_id":"uuid","momo_ref":"MTN-12345","amount":100.0 }`

### Reviews

* `POST /api/v1/bookings/{id}/reviews` — after completion
  Body: `{ "rating": 4, "comment":"Good job" }`

### Admin

* `GET /api/v1/admin/reports/transactions?from=&to=` — CSV export

(Full OpenAPI file should be generated programmatically — I can generate a swagger.json next if you want.)

---

# 6. Sequence Flows (Important flows)

## 6.1 Booking + Payment (Happy Path)

1. Customer hits search → selects provider/service → clicks Book.
2. Frontend POST `/bookings` → backend validates provider availability (no overlap).
3. Booking created (status: `requested`).
4. Backend triggers notification to provider (push/SMS/email).
5. Customer initiates payment: `/payments/momo/charge` → backend calls MTN MoMo API (sandbox).
6. MoMo returns payment status asynchronous via webhook → `/payments/webhook/momo` updates transaction to `success`.
7. On success, booking.payment\_status = `paid`, booking.status = `confirmed`. Commission computed and stored.
8. Provider receives confirmation, performs job, marks `in_progress` → `completed`.
9. Customer leaves review.

## 6.2 Provider Accepts / Suggests New Time

* Provider receives booking request → may accept or propose new time (PATCH endpoint). The system notifies customer; upon acceptance, status transitions to `confirmed`.

## 6.3 Dispute Flow

* Customer opens dispute within 7 days with evidence photos attached. Admin notified. Admin reviews, requests more evidence or issues refund. Refund flow triggers transaction reversal or manual refund.

---

# 7. Core Algorithms & Business Logic

## 7.1 Booking Conflict Detection (pseudocode)

```ts
// inputs: provider_id, proposed_start, proposed_end
async function isAvailable(provider_id, proposed_start, proposed_end) {
  const overlapping = await db.query(`
    SELECT 1 FROM bookings
    WHERE provider_id = $1
      AND status IN ('confirmed','in_progress')
      AND NOT (scheduled_end <= $2 OR scheduled_start >= $3)
    LIMIT 1`, [provider_id, proposed_start, proposed_end]);
  return overlapping.rowCount === 0;
}
```

* Use DB-level transaction and SELECT ... FOR UPDATE for race conditions.
* Alternatively queue booking creation via Redis lock `provider:${id}:lock`.

## 7.2 Commission Calculation

* Commission = platform\_rate% \* total\_amount. Store both amounts on booking and transaction for audit.

## 7.3 Idempotent Webhook Handling (payments)

* Webhook must include external `momo_txn_id`. For each webhook, check if a transaction with that external id exists; if so, ignore duplicate.

---

# 8. Security Design

## 8.1 Authentication & Authorization

* OTP-based login; issue JWT with short TTL (e.g., 15m) and refresh token (7d).
* Store refresh tokens hashed in DB to allow revocation.
* RBAC middleware for admin routes.

## 8.2 Data Protection

* TLS everywhere (HTTPS).
* Hash passwords with Argon2 / bcrypt (if any).
* Encrypt PII fields at rest using DB-level encryption or envelope encryption (KMS).
* Limit access to verification documents; only admin role can view; audit every access.

## 8.3 API Security

* Rate-limit endpoints (100 req/min per IP; stricter for auth).
* Input validation with Zod/Joi to prevent injection.
* Use parameterized queries via ORM to prevent SQL injection.
* Sanitize uploaded files; virus-scan if possible.

## 8.4 Payment Security

* Never store full payment credentials; store only necessary tokens.
* Use HMAC signed webhooks and verify signature.
* Maintain a transaction ledger for reconciliation.

---

# 9. Scalability & Performance Strategies

* **Read-heavy endpoints** (provider search): cache responses in Redis for 30–60s, invalidate on profile updates.
* **Geospatial search**: use PostGIS or precomputed geohash and bounding box.
* **Background workers**: offload notifications, image resizing.
* **Autoscaling**: use platform with autoscaling for API workers (CPU/memory based).
* **Connection pooling**: tune DB pool sizes; use PgBouncer if needed.
* **CDN**: serve static assets through CDN for global scale.
* **Load testing**: run k6 scripts to validate 100-1000 concurrent users before scaling decisions.

---

# 10. Testing Strategy (expanded)

## 10.1 Test Types

* **Unit Tests**: business logic; coverage goal ≥ 70% for core modules (booking, payments, auth).
* **Integration Tests**: DB + API; use test DB and sandbox MoMo mocks.
* **Contract Tests**: ensure webhook payloads are parsed correctly even as 3rd-party updates.
* **E2E Tests**: Playwright for flows: signup → search → booking → payment → review.
* **Security Tests**: OWASP checks, dependency scanning.
* **Load Tests**: k6/Locust scripts; validate 95th percentile latency under expected load.
* **UAT**: Manual testing with pilot providers and customers.

## 10.2 Test Matrix (example)

| Feature          |     Unit | Integration | E2E | Load | Security |
| ---------------- | -------: | ----------: | --: | ---: | -------: |
| Auth OTP         |        ✅ |           ✅ |   ✅ |    ✅ |        ✅ |
| Booking creation |        ✅ |           ✅ |   ✅ |    ✅ |        ✅ |
| MoMo payment     | ✅ (mock) | ✅ (sandbox) |   ✅ |    ✅ |        ✅ |
| Reviews          |        ✅ |           ✅ |   ✅ |    - |        ✅ |

---

# 11. CI/CD & Deployment

## 11.1 Git Workflow

* Branches: `main` (prod), `develop` (staging), `feature/*`, `hotfix/*`.
* PR required for merges to `develop` and `main`.

## 11.2 GitHub Actions (example pipeline)

* On PR: `lint` → `typecheck` → `unit tests` → `build`.
* On merge to `develop`: run full test suite → deploy to staging (auto).
* On merge to `main`: run tests → manual approval job → deploy to production.

## 11.3 Infra as Code

* Use Terraform / Pulumi to provision: DB, Redis, object storage, DNS, certs.
* Store secrets in provider secret manager.

## 11.4 Rollback Strategy

* Use blue/green or canary deployments.
* Keep DB migrations backward compatible; in case of major migration, have pre- and post-migration scripts and on-demand snapshot rollback.

---

# 12. Monitoring, Logging & Alerting

## 12.1 Metrics to monitor

* Request rate, error rate (5xx), latency (p95), payment success/failure rate, booking creation rate, background job queue length.

## 12.2 Alerts

* Payment failure rate > 5% in 15min → pager.
* Error rate spike (>1% of requests) → email.
* Background queue length > threshold → Slack alert.

## 12.3 Logs & Traces

* Structure logs in JSON. Correlate via request-id in headers.
* Use Sentry for exceptions and traces for slow endpoints (use OpenTelemetry).

---

# 13. Backup & Disaster Recovery

* Nightly DB backups; point-in-time recovery enabled (retain 30 days).
* Backup schedule: daily full, hourly WAL logs.
* Test backup restoration quarterly.
* Store backups in separate region or cold storage.

---

# 14. Operational Runbooks (essential)

## 14.1 Common Tasks

* **Restart API**: `kubectl rollout restart deployment/api` or restart service in Render.
* **Restore DB**: steps to restore from latest snapshot (documented).
* **Manual payout**: admin procedure to release provider payouts (verify transactions).
* **Revoke tokens**: revoke all sessions for user (delete refresh tokens).

## 14.2 Incident Response

1. Triage (severity).
2. Identify affected services.
3. Rollback or hotfix (if needed).
4. Communicate to stakeholders & users.
5. Post-mortem w/ root cause & action items.

---

# 15. Operational & Business Considerations

* **Onboarding Playbook** for providers (field visits, simple mobile forms).
* **KYC Process**: manual admin verification initially; automate later with document OCR + verification partners.
* **Pricing Strategy**: initial 0% commission for first 30 days to onboard providers; then 5–10% after.
* **Customer Support**: simple in-app contact form + WhatsApp + email.

---

# 16. Acceptance Criteria & Readiness Checklist (for production release)

* All P0 FRs implemented and tested (unit + integration).
* Payment integration tested in sandbox + manual fallback verified.
* UAT with 10 providers + 30 customers completed; critical defects = 0.
* Monitoring (Sentry + metrics) configured and alerts set.
* Backup & restore validated.
* Legal: T\&Cs and Privacy Policy uploaded; business registration in process.
* Deployment: CI/CD green for at least 2 consecutive deploys to staging.
* Documentation: README, deployment guide, runbook, API docs (OpenAPI).

---

# 17. Cost & Resource Estimates (ballpark for MVP, monthly)

* Domain: \$10/year.
* Hosting (API + DB + Redis): \$30–200/month depending on provider.
* Object storage: \$5–20/month.
* SMS (OTP): \$10–100/month depending on volume.
* Misc (Sentry, CDN): \$10–50/month.
* Total monthly (low usage): **\$50–300/month**. Adjust as usage grows.

---

# 18. Implementation Roadmap (detailed tasks per week — actionable)

Week 0 (setup)

* Initialize repo, TypeScript + linter + pre-commit hooks.
* Create infra tf skeleton, dev env Docker compose.

Week 1 (auth & users)

* Implement OTP flows, user model, JWT.
* Create signup/login UI pages.

Week 2 (providers & search)

* Provider profile CRUD, services model, geolocation store.
* Basic search API + frontend list page.

Week 3 (bookings)

* Booking endpoints, conflict checks, provider availability toggle.
* Booking UI and provider notification stub.

Week 4 (payments)

* Mock MoMo integration; manual payment flow; transaction ledger.
* UI for payment initiation and confirmation.

Week 5 (messaging + reviews)

* Per-booking chat, reviews, rating aggregation.
* Provider dashboard basic.

Week 6 (admin + reports)

* Admin panel, disputes flow, CSV exports.

Week 7 (tests + security)

* Unit + integration tests; security checklist; load test baseline.

Week 8 (UAT + polish)

* Onboard pilot users, record feedback, polish UX, fix bugs.

Week 9 (prepare prod)

* Final migrations, backups, legal pages, deploy prod.

---

# 19. Deliverables You’ll Have (by production-ready MVP)

* Full codebase (frontend + backend) with tests.
* Database schema and migration scripts.
* OpenAPI spec and API docs.
* Admin dashboard.
* CI/CD pipeline configured.
* Monitoring & backups active.
* Runbooks and operational docs.
* Pilot UAT report.

---

# 20. Next Action Items (immediate, pick one to start)

1. Generate full **OpenAPI (swagger.json)** for all endpoints above (I can output it).
2. Produce **Prisma schema** or SQL migration files from the DDL.
3. Scaffold a **Next.js + Express/TS** starter repo with folder structure, auth, and sample pages.
4. Create a **detailed test plan** and sample Jest + Playwright test files for core flows.
5. Draft the **provider onboarding flow (UX)** with wireframes and microcopy for field visits.

Which of these would you like me to generate now? I’ll produce the artifact straight away.
