# DKUT Farm Management System Backend Testing Checklist

Run from `backend/` after MongoDB is available and the seed has been loaded:

```text
npm test
npm start
```

Use `admin@example.com / ChangeMe123!` for the seeded admin. Register two customers so order ownership can be tested. Replace each `Actual result` and `Pass/Fail` entry with the observed response from the running API.

## Authentication

| Test | Endpoint | Method | Expected result | Actual result | Pass/Fail |
|---|---|---|---|---|---|
| Register a customer | `/api/auth/register` | POST | `201`; customer user and JWT returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Login as customer | `/api/auth/login` | POST | `200`; customer JWT returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Login as admin | `/api/auth/login` | POST | `200`; admin JWT returned | Seed hash fixed; live request blocked by MySQL service | Blocked |
| Invalid login | `/api/auth/login` | POST | `401` with invalid-credentials message | Blocked: local MySQL service could not be started in this session | Blocked |
| Duplicate registration | `/api/auth/register` | POST | `409` | Blocked: local MySQL service could not be started in this session | Blocked |
| Protected route without auth | `/api/auth/me` | GET | `401` | Route contract verified; live request blocked by MySQL service | Blocked |
| Customer on admin route | `/api/users` | GET | `403` | Route contract verified; live request blocked by MySQL service | Blocked |

## Produce

| Test | Endpoint | Method | Expected result | Actual result | Pass/Fail |
|---|---|---|---|---|---|
| Admin adds produce | `/api/produce` | POST | `201`; produce and inventory created | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin views produce | `/api/produce` | GET | `200`; active produce list returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin edits produce | `/api/produce/:id` | PATCH | `200`; values updated | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin deletes produce | `/api/produce/:id` | DELETE | `204`; produce and inventory removed | Blocked: local MySQL service could not be started in this session | Blocked |
| Customer views produce | `/api/produce` | GET | `200`; active produce list returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Customer admin-only produce operation | `/api/produce` | POST | `403` | Route contract verified; live request blocked by MySQL service | Blocked |

## Jobs and Applications

| Test | Endpoint | Method | Expected result | Actual result | Pass/Fail |
|---|---|---|---|---|---|
| Admin creates casual job | `/api/jobs` | POST | `201`; job created | Blocked: local MySQL service could not be started in this session | Blocked |
| Customer views open jobs | `/api/jobs` | GET | `200`; open jobs returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Customer applies | `/api/applications/jobs/:jobId` | POST | `201`; application created | Blocked: local MySQL service could not be started in this session | Blocked |
| Customer views own application | `/api/applications/my` | GET | `200`; only own applications returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin views applications | `/api/applications` | GET | `200`; applications returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin shortlists applicant | `/api/applications/:id/review` | PATCH | `200`; status `SHORTLISTED` | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin rejects applicant | `/api/applications/:id/review` | PATCH | `200`; status `REJECTED` | Blocked: local MySQL service could not be started in this session | Blocked |

## Orders and Inventory

| Test | Endpoint | Method | Expected result | Actual result | Pass/Fail |
|---|---|---|---|---|---|
| Customer creates order | `/api/orders` | POST | `201`; order total is calculated | Blocked: local MySQL service could not be started in this session | Blocked |
| Customer views own orders | `/api/orders/my` | GET | `200`; only that customer's orders returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin views orders | `/api/orders` | GET | `200`; orders returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin changes order status | `/api/orders/:id/status` | PATCH | `200`; status updated | Blocked: local MySQL service could not be started in this session | Blocked |
| Customer cannot access another order | `/api/payments/orders/:otherOrderId` and `/api/deliveries/orders/:otherOrderId` | GET | `403` or no data; no other-customer data exposed | Ownership checks verified in controllers; live request blocked by MySQL service | Blocked |
| Admin views inventory | `/api/inventory` | GET | `200`; quantities and low-stock flags returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin updates stock | `/api/inventory/:produceId` | PATCH | `200`; quantity updated | Blocked: local MySQL service could not be started in this session | Blocked |
| Order reduces stock | `/api/orders` | POST | Inventory decreases by ordered quantity atomically | Transaction and update verified in controller; live request blocked by MySQL service | Blocked |
| Low-stock detection | `/api/inventory/low-stock` | GET | `200`; rows at or below threshold returned | Blocked: local MySQL service could not be started in this session | Blocked |

## Payments and Deliveries

| Test | Endpoint | Method | Expected result | Actual result | Pass/Fail |
|---|---|---|---|---|---|
| Create payment record | `/api/payments/orders/:orderId` | POST | `201`; payment has correct `order_id` and `PENDING` status | Blocked: local MySQL service could not be started in this session | Blocked |
| Confirm payment association | `/api/payments/orders/:orderId` | GET | `200`; every payment belongs to requested order | Ownership query verified; live request blocked by MySQL service | Blocked |
| Admin creates delivery | `/api/deliveries/orders/:orderId` | POST | `201`; delivery belongs to order | Blocked: local MySQL service could not be started in this session | Blocked |
| Admin updates delivery status | `/api/deliveries/:id/status` | PATCH | `200`; status updated | Blocked: local MySQL service could not be started in this session | Blocked |
| Customer views own delivery | `/api/deliveries/orders/:orderId` | GET | `200`; own delivery status returned | Blocked: local MySQL service could not be started in this session | Blocked |

## Reports

| Test | Endpoint | Method | Expected result | Actual result | Pass/Fail |
|---|---|---|---|---|---|
| Dashboard statistics | `/api/reports/dashboard` | GET | `200`; customer, produce, stock, sales, order, job, and application totals returned | Blocked: local MySQL service could not be started in this session | Blocked |
| Verify totals against database | `/api/reports/dashboard` plus direct aggregate queries | GET / SQL | API totals equal database aggregates | Blocked: local MySQL service could not be started in this session | Blocked |

## Executed non-database checks

| Check | Result |
|---|---|
| Route contract tests | Passed after adding `npm test` coverage |
| Seed admin password verification | Passed after correcting `seed.sql` hash |
| Frontend modified | No |

## MongoDB integration setup

Start the Docker replica set from the project root, then configure the backend:

```powershell
docker compose up -d mongodb
Copy-Item backend/.env.docker.example backend/.env
node backend/database/seed-mongo.js
npm --prefix backend test
```

The live endpoint rows in this checklist still need to be executed against the running API. The current environment's Docker Linux engine returned HTTP 500, so the database-backed workflow rows remain marked `Blocked` until Docker Desktop is healthy.