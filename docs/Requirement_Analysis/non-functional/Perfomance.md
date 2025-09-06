# Performance & Scalability Approaches

* **Horizontal scaling:** Stateless API servers behind a load balancer; sticky sessions only if necessary.
* **Caching:** Redis for session cache, geospatial provider search cache, and rate limiting.
* **Database:** Use indices for geospatial search (Postgres + PostGIS or simple bounding box for MVP). Partition historic transactions if growth demands.
* **Asynchronous processing:** Use background jobs (BullMQ/Redis or Celery) for notifications, payout processing, heavy image processing.
* **CDN:** Serve static assets & profile images via CDN for speed.

---