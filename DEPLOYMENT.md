# DKUT Farm Management System Deployment

## Architecture

- Build the React application as static files and host the `build` directory.
- Run the Express API as a Node.js service.
- Use MongoDB Atlas or another hosted MongoDB replica set.

The frontend and API may be hosted separately. The API must allow the exact
frontend origin through `FRONTEND_ORIGIN`.

## Frontend

Set the API URL before building:

```powershell
$env:REACT_APP_API_URL="https://api.example.com/api"
npm ci
npm run build
```

Host `build` with SPA fallback enabled so routes such as `/app/dashboard`
serve `index.html`.

### Vercel

The repository includes `vercel.json` with the Create React App build and SPA
fallback settings. Create a Vercel project from the repository root and set:

```env
REACT_APP_API_URL=https://<render-service>.onrender.com/api
```

Deploy the frontend after the Render service is available so the API URL is
known.

## Backend

Install and start:

```powershell
cd backend
npm ci --omit=dev
node server.js
```

Required production variables:

```env
PORT=5000
NODE_ENV=production
FRONTEND_ORIGIN=https://app.example.com
JWT_SECRET=<unique-random-secret-at-least-32-characters>
JWT_EXPIRES_IN=1d
MONGODB_URI=mongodb+srv://...
MONGODB_DB=dkut_farm
MONGODB_TRANSACTIONS=true
```

Optional provider variables are listed in `backend/.env.example`. Keep all
secrets in the hosting provider's secret manager and never commit `.env`.

The API health check is:

```text
GET /api/health
```

It returns success only after the MongoDB connection responds to a ping.

### Render

The repository includes `render.yaml` for the backend service. Create a Render
Blueprint from the repository, then set these secret values in the Render
dashboard:

```env
MONGODB_URI=mongodb+srv://<user>:<url-encoded-password>@<cluster>.mongodb.net/
FRONTEND_ORIGIN=https://<vercel-project>.vercel.app
```

Add the Render outbound IP ranges, or use the appropriate Atlas network access
policy for the service, and verify `/api/health` before deploying the
frontend.

## MongoDB

Create a restricted database user, enable network access for the API host,
and configure backups. The application initializes its existing Mongoose
indexes at startup. Do not delete the existing database during deployment.

Transactions must be enabled in production because order creation updates the
order, payment, and inventory records as one unit.

## SMS and payments

Africa's Talking credentials must be configured on the backend only. Verify
the account environment, username, API key, sender configuration, and
recipient rules before enabling production SMS.

Configure M-Pesa variables only when a public HTTPS callback URL and valid
provider credentials are available. Never expose provider credentials in the
React build.

## Verification checklist

1. Build the frontend with the deployed API URL.
2. Start the backend with production environment variables.
3. Confirm `GET /api/health` returns `{"status":"ok","database":"connected"}`.
4. Verify login, customer isolation, admin authorization, order creation,
   inventory updates, and payment/delivery records.
5. Test SMS and payment callbacks with provider test credentials.
6. Confirm frontend deep links and browser refresh work on the hosting platform.
