# Use Cases & User Stories (as GIVEN/WHEN/THEN)

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