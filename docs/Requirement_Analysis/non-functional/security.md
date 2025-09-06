# Security & Privacy Controls

* **Authentication**: OTP + optional password; strong JWT secrets, refresh tokens with revocation list.
* **Authorization**: RBAC: customer / provider / admin. Permission checks for all sensitive endpoints.
* **Data protection**: Encrypt sensitive fields at rest (PII encryption), use TLS in transit.
* **Secure coding:** Sanitize inputs (prevent SQLi, XSS), limit file upload types and sizes (max 5MB, check mime type), store files in cloud object storage with signed URLs.
* **KYC docs:** Access controlled. Documents should be encrypted and access logged.
* **Payment security:** Do not store full MoMo credentials; store provider payouts tokens securely. Follow payment provider best practices.
* **Rate limiting & anti-fraud:** Limit login attempts, bookings per user; detect suspicious patterns; block repeated failed OTP attempts.
* **Incident response:** Prepare playbook: revoke tokens, notify affected users, restore backups.
