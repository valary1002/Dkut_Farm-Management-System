# DKUT Farm Management API

Separate Express/MongoDB REST API for the existing React frontend.

## Setup

1. Install Node.js.
2. Create a MongoDB Atlas cluster and a database user with read/write access to `dkut_farm`.
3. In Atlas, add the backend machine's public IP address under **Network Access**.
4. Copy `.env.example` to `.env`, set `MONGODB_URI` to the connection string from Atlas, and replace `JWT_SECRET` with a long random value.
5. Install dependencies with `npm install`.
6. Seed development records with `node database/seed-mongo.js`.
7. Start the API with `npm run dev`.

The backend uses the database named by `MONGODB_DB` (default: `dkut_farm`) from the `MONGODB_URI` connection string. Atlas SRV strings must use a URL-encoded password; for example, encode `@` as `%40`. The API uses the Mongoose client pool, which is created once and reused for the lifetime of the server.

## VS Code connection

Install a MongoDB extension such as MongoDB for VS Code, connect using the URI from `.env`, and select the `dkut_farm` database. The extension is only for browsing and querying; the API connects through the same `MONGODB_URI` value.

For MongoDB Atlas, set `MONGODB_TRANSACTIONS=true`, add the current IP address to the Atlas network access list, and create a database user with access to `dkut_farm`. Atlas supports the transactions used by order creation. Verify the connection with `http://localhost:5000/api/health` after starting the API; it returns `{"status":"ok","database":"connected"}` when the Atlas ping succeeds.

The API listens on `http://localhost:5000` by default. The React frontend is intentionally not connected yet.

Customer purchases use cash on delivery. The order stores the delivery address and phone number, creates a pending cash-on-delivery payment record, and sends an order confirmation SMS through Africa's Talking when `AT_USERNAME`, `AT_API_KEY`, and optionally `AT_SENDER_ID` are configured in `.env`. If SMS settings are not configured, the order is still received and the API returns a clear notification message so it can be configured later.

The Mongo seed script creates a development admin account (`admin@example.com` / `ChangeMe123!`), sample produce, inventory, and one open job. Change the admin password before sharing the database or deploying.

## Roles

Only `ADMIN` and `CUSTOMER` are supported. Public registration always creates a `CUSTOMER`; administrators should be seeded through a controlled database process.

## Security notes

- Passwords are stored as bcrypt hashes.
- JWT secrets and database credentials come from environment variables.
- Customer order and application queries are scoped to the authenticated customer.
- Payment records are provider-neutral and remain `PENDING` until a future payment integration updates them.
