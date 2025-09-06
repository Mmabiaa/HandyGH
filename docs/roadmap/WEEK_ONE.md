# Week 1 — Detailed Plan (Authentication & Users / Sprint 1)

Nice — we’re treating this like a real engineering sprint. Below is a **comprehensive, non-ad hoc** plan for *Week 1* that follows our roadmap, uses software engineering best practices, includes verification/validation, and reduces risk. It’s broken down into daily tasks, artifacts to produce, test cases, CI requirements, branch/PR rules, and acceptance criteria (“Definition of Done”).

---

## Goal for Week 1 (Sprint objective)

Deliver a secure, tested **Authentication & User Management** foundation for HandyGH so further features (providers, bookings, payments) plug in cleanly.
**Core deliverables:**

* Backend: OTP request/verify, JWT issuance & refresh, user model + migrations, auth middleware, refresh-token revoke, basic user CRUD API.
* Frontend: mobile-first Signup/Login pages, auth context, protected route sample (profile).
* Dev infra: repo scaffold, Docker Compose for dev (Postgres + Redis), CI pipeline (lint + unit tests), README dev setup.
* Tests: unit + integration coverage for auth flows; E2E smoke test for signup → login.

---

## Assumptions (explicit)

* We use **Node.js + TypeScript** backend (Express/Fastify) + **Next.js + TypeScript** frontend.
* PostgreSQL for DB; Redis optional for OTP throttling and job queue.
* SMS OTP will be mocked in dev (pluggable provider interface). Use real SMS in later sprint.
* MoMo payment integration postponed to Week 4+; we do not touch payments this week.
* You are working solo; keep scope tightly focused on secure, tested auth flows.

---

## Success Criteria (what “done” looks like)

1. `POST /api/v1/auth/otp/request` and `POST /api/v1/auth/otp/verify` work end-to-end (mock SMS) with tests.
2. JWT access + refresh tokens issued and refresh flow implemented; refresh tokens revocable.
3. User record created in DB with required fields (phone, email optional).
4. Frontend signup/login components working and protected sample page accessible only with token.
5. CI runs: lint → typecheck → unit tests (critical modules) on PRs.
6. README contains dev setup, env vars, DB migration commands.
7. Basic load / rate-limiting rules documented for OTP endpoints.

---

## Day-by-day plan (granular tasks + verification)

### Day 1 — Setup & repo baseline

**Tasks**

* Create GitHub repo + branch protection rules (`main` protected, `develop` branch).
* Add `.gitignore`, `README.md`, LICENSE.
* Scaffold monorepo or two folders: `/backend` and `/frontend`. (We recommend single repo for MVP.)
* Add TypeScript, ESLint, Prettier, Husky + lint-staged pre-commit hooks.
* Add Docker Compose (Postgres, Redis) for local dev.

**Artifacts**

* `README.md` skeleton (how to run dev, tests).
* `docker-compose.yml` with postgres & redis.

**Verification**

* `docker-compose up` brings up DB & Redis.
* `npm run lint` passes on scaffold.

---

### Day 2 — DB schema + migrations (users + refresh tokens)

**Tasks**

* Design & implement initial DB schema for `users`, `refresh_tokens`, and `audit_logs`.
* Add migration tooling (Prisma Migrate or TypeORM/knex migrations).
* Create seed script to create an initial admin/test user.

**Minimal DDL (Postgres)**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  user_agent TEXT,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

**Artifacts**

* Migration files committed; `npm run migrate` documented.

**Verification**

* Run migration in local Docker postgres and confirm tables exist.

---

### Day 3 — Backend: OTP flow design & implementation (request + verify)

**Tasks**

* Implement OTP provider interface (pluggable). Provide a **MockSMSProvider** for dev that logs OTPs to console and returns success.
* Implement endpoints:

  * `POST /api/v1/auth/otp/request` — body `{ phone }`

    * Validations: phone format, rate limit per phone/IP.
    * Stores OTP hashed in `otp_store` (Redis) with TTL (5–10 min) and rate-limiting counters.
  * `POST /api/v1/auth/otp/verify` — body `{ phone, otp }`

    * Verifies OTP, creates or returns user, issues JWT access + refresh token.
* Implement OTP security:

  * OTP length = 6 numeric, use HMAC or bcrypt for stored OTP hashes.
  * Rate limiting: max 5 requests per phone/hour, lockout if >10 failed verifies per hour.
  * Single use OTP: delete on success.
* Logging: audit `auth_otp_requested` and `auth_otp_verified` events in `audit_logs`.

**Artifacts**

* `src/services/otpService.ts`, `src/providers/sms/mockSms.ts`
* Redis usage for otp storage keys: `otp:{phone}` and counters.

**Verification**

* Unit tests for OTP generation, hashing and verify logic.
* Integration test: `POST /auth/otp/request` -> retrieve OTP from mock log -> `POST /auth/otp/verify` -> 200 + tokens.

**Security/Edge Cases**

* Brute-force protections: exponential backoff + lockout.
* Do not log the OTP in production (mock only).

---

### Day 4 — Backend: JWT & refresh token handling

**Tasks**

* Choose JWT config:

  * `ACCESS_TOKEN_TTL` e.g., 15m
  * `REFRESH_TOKEN_TTL` e.g., 7d
  * Use asymmetric keys (recommended) or strong symmetric secret (HMAC) stored in secret manager.
* Implement token creation & verification utilities.
* Store **refresh token hash** in `refresh_tokens` table with `expires_at`.
* Create endpoints:

  * `POST /api/v1/auth/token/refresh` — body `{ refresh_token }` -> issues new access + refresh tokens, revoke old refresh token.
  * `POST /api/v1/auth/logout` — revokes refresh token(s) for session.
* Middleware: `authMiddleware` to protect routes; attach `req.user`.

**Artifacts**

* `src/services/tokenService.ts`, `src/middleware/auth.ts`

**Verification**

* Unit tests: token generation/verification, refresh flow, revocation.
* Integration test: full flow signup → login -> call protected route -> refresh tokens -> logout revoke -> protected route fails.

**Security**

* Use token binding to user\_agent (store user agent + IP in refresh\_tokens record).
* Use `bcrypt` to hash refresh tokens before storing.

---

### Day 5 — Frontend: Signup/Login pages & Auth context

**Tasks**

* Create Next.js pages:

  * `/auth/login` — phone input -> calls `/auth/otp/request`, shows OTP input modal.
  * `/auth/verify` — accepts OTP -> calls `/auth/otp/verify`.
  * `/profile` — protected route showing current user profile (demo).
* Implement `AuthContext`:

  * Manages tokens (store refresh token in http-only cookie or secure storage; **best practice**: store refresh token in http-only secure cookie; access token in memory).
  * Attach Authorization header in API calls.
* UX: Mobile-first forms, validation feedback, friendly error messages for OTP errors.

**Artifacts**

* `frontend/components/AuthForm.tsx`, `frontend/context/AuthContext.tsx`

**Verification**

* Manual test: request OTP -> copy logged OTP from dev server -> verify -> token stored -> access profile page.
* E2E (Playwright): simulate user flow.

**Security**

* Use http-only secure cookie for refresh token to reduce XSS risk. Access token stored in memory only.

---

### Day 6 — Tests, CI & PR checklist

**Tasks**

* Add unit tests for backend modules (Jest), integration tests that use test Postgres instance (Docker).
* Add minimal E2E test (Playwright) for signup/login/profile flow.
* Add GitHub Action workflow `ci.yml`:

  * Steps: checkout → setup node → install → lint → typecheck → run unit tests (fast) → build.
* PR template & `CONTRIBUTING.md` with code standards, commit message style, review checklist.

**CI sample (short)**

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage --runInBand
```

**Verification**

* Create a PR against `develop` and ensure CI runs and passes.

---

### Day 7 — Polish, docs, UAT prep & wrap-up

**Tasks**

* Write `AUTH_README.md` describing OTP flow, rate-limits, token policies, and how to switch mock SMS → real SMS provider.
* Create Postman collection or OpenAPI stubs for auth endpoints.
* Run through acceptance tests and check off success criteria.
* Create Jira/GitHub issues for any leftover bugs or scope items and prioritize for next sprint.

**Artifacts**

* `docs/openapi-auth.yaml` (stub)
* Postman/Insomnia collection export
* Sprint retrospective notes, backlog grooming items for Week 2.

**Verification**

* Acceptance test checklist completed (see below).

---

## Acceptance Tests / Test Cases (explicit, runnable)

### AT-1: OTP Request & Verify (Happy Path)

1. `POST /api/v1/auth/otp/request` with `{ phone: "+233XXXXXXXXX" }` → 200 + `{ otp_sent: true }`.
2. Retrieve OTP from mock SMS logger (dev only).
3. `POST /api/v1/auth/otp/verify` with `{ phone, otp }` → 200 + `{ access_token, refresh_token }`.
4. Call protected `GET /api/v1/users/me` with Bearer access token → 200 + user payload.

**Pass criteria:** tokens returned, user record created (if new), DB shows user.

---

### AT-2: Refresh Token Flow

1. Use `refresh_token` to call `POST /api/v1/auth/token/refresh`.
2. Receive new `access_token` and `refresh_token`.
3. Old refresh token should be revoked (DB `revoked=true`).
4. Old access token should expire and not be usable after TTL.

**Pass criteria:** new tokens are valid; old refresh token cannot be used again.

---

### AT-3: Rate Limiting & Brute-force Protection

1. Simulate >5 OTP requests in 1 hour for same phone → `429 Too Many Requests`.
2. Simulate >10 wrong OTP attempts → account locked for a configured window.

**Pass criteria:** server returns 429/403 and logs events; lockout enforced.

---

### AT-4: Logout & Revoke

1. Call `POST /api/v1/auth/logout` with current refresh token.
2. Verify `refresh_tokens` entry is `revoked=true`.
3. Attempt to use revoked refresh token to refresh -> 401.

---

## PR Checklist (every PR during Week 1)

* [ ] Linked to a GitHub issue/epic.
* [ ] Passing CI (lint, typecheck, unit tests).
* [ ] Reasonable unit test coverage for changed modules.
* [ ] README updated if required.
* [ ] No secrets checked into repo.
* [ ] Security checklist (input validation, no raw SQL without parameterization).

---

## Environment variables (dev / staging / prod)

List them now and put placeholders in `.env.example`:

```
# App
NODE_ENV=development
APP_URL=http://localhost:3000

# JWT
JWT_ACCESS_SECRET=<<random_secret_or_private_key>>
JWT_REFRESH_SECRET=<<random_secret_or_private_key>>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# DB
DATABASE_URL=postgres://user:pass@db:5432/handygh_dev

# Redis
REDIS_URL=redis://redis:6379

# SMS (mock or provider)
SMS_PROVIDER=mock
SMS_API_KEY=

# Other
SENTRY_DSN=
```

**Security note:** Use GitHub Secrets for CI and production secret management.

---

## Risks & Mitigations (specific to Week 1)

* **Risk:** OTP SMS provider delays/blocking.

  * **Mitigation:** Mock provider for dev; design provider interface so switching is trivial; start with manual OTP admin flow if provider is unavailable.
* **Risk:** Token leakage (XSS).

  * **Mitigation:** Store refresh token in http-only secure cookie; keep access token in memory only; follow OWASP.
* **Risk:** Race conditions on OTP verify or refresh token reuse.

  * **Mitigation:** Use DB transactions, atomic compare-and-set in Redis for OTP usage, hash+compare for refresh tokens; set unique constraints.
* **Risk:** Solo developer burnout due to scope creep.

  * **Mitigation:** Strictly follow Week 1 scope; anything non-critical → backlog.

---

## Deliverables to commit by Week 1 end

1. `backend/`:

   * Migrations + schema
   * OTP & token services, endpoints implemented
   * Unit & integration tests passing
2. `frontend/`:

   * Login & OTP verify pages + auth context
   * Protected `/profile` sample page
3. `docker-compose.yml`, `.env.example`, `README.md` (dev setup)
4. `ci.yml` pipeline in `.github/workflows/`
5. `docs/openapi-auth.yaml` or Postman collection
6. Sprint 1 report: issues closed, test coverage, known issues (with severity), next sprint priorities.

---

## Definition of Done (hard)

For Week 1 to be accepted:

* All P0 auth FRs implemented and tested (FR-1..FR-4 from SRS coverage).
* CI green on `develop`.
* UAT with at least 2 pilot users (or manual test checklist completed).
* `README` + onboarding docs created.
* No critical or high-severity defects open.

---

## Quick code / API stubs (for immediate copy-paste)

**OTP request (example payload)**
`POST /api/v1/auth/otp/request`
Body:

```json
{ "phone": "+233241234567" }
```

**OTP verify (example payload)**
`POST /api/v1/auth/otp/verify`
Body:

```json
{ "phone": "+233241234567", "otp": "345678" }
```

**Protected sample endpoint**
`GET /api/v1/users/me`
Header: `Authorization: Bearer <access_token>`

---

## Next after Week 1 (brief)

* Week 2: Provider onboarding & search (provider profile CRUD, categories, geolocation).
* But first: merge auth branch to `develop`, run small pilot, collect feedback and adjust token TTLs, UX copy and rate limits.

---
