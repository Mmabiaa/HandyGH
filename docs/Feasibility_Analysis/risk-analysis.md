#  Risk Analysis & Mitigation

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
