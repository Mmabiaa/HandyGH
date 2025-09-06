## Non-Functional Requirements (NFR) — measurable

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