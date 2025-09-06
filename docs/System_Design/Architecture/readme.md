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