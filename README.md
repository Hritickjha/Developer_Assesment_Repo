# Microsoft Client Operations Portal

An internal staff tool for managing client Microsoft 365 accounts. Staff use it to view client account status, sync Microsoft 365 user data, trigger onboarding workflows, and review audit activity.

---

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React + Vite + Tailwind CSS         |
| Backend  | Express 5 (Node.js 24)             |
| Database | SQLite via `node:sqlite` (built-in) |
| Auth     | MSAL-style frontend login           |
| Runtime  | pnpm workspaces, TypeScript 5.9     |

---

## Prerequisites

- Windows, macOS, or Linux
- Node.js 24+
- pnpm 9+

---

## Getting Started

Install dependencies:

```text
pnpm install
```

Start the API and frontend:

```text
pnpm dev
```

Open `http://localhost:5173`. The frontend proxies `/api` requests to the API server on port `8080`.

The database is created automatically on first run and seeded with demo data.

---

## Environment Variables

### API server (`artifacts/api-server/`)

| Variable   | Default                    | Description                        |
|------------|----------------------------|------------------------------------|
| `PORT`     | `8080`                     | Port the Express server listens on |
| `DB_PATH`  | `<cwd>/portal.db`          | Path to the SQLite database file   |
| `NODE_ENV` | `development`              | `development` or `production`      |

### Frontend (`artifacts/portal/`)

| Variable                 | Default                 | Description                                 |
|--------------------------|-------------------------|---------------------------------------------|
| `PORT`                   | `5173`                  | Port the Vite development server listens on |
| `BASE_PATH`              | `/`                     | Base path used by the frontend              |
| `API_URL`                | `http://127.0.0.1:8080` | API target used by the development proxy    |
| `VITE_MSAL_CLIENT_ID`    | Not set                 | Azure AD app registration client ID         |
| `VITE_MSAL_TENANT_ID`    | `common`                | Azure AD tenant ID                          |
| `VITE_MSAL_REDIRECT_URI` | Not set                 | Redirect URI registered in Azure AD         |

---

## Project Structure

```
artifacts/
  api-server/          # Express backend
    src/
      db/              # Database init and seed
      middleware/      # Auth middleware
      routes/          # API route handlers
  portal/              # React frontend
    src/
      lib/             # MSAL config, auth helpers, API client
      pages/           # Page components
      components/      # Shared layout and UI
docs/                  # Project documentation
```

---

## API Routes

| Method | Route                   | Description                           |
|--------|-------------------------|---------------------------------------|
| GET    | `/api/me`               | Returns the current user profile       |
| GET    | `/api/clients`          | Lists all clients                     |
| GET    | `/api/clients/:id`      | Returns single client with M365 users |
| GET    | `/api/graph/users`      | Returns M365 users for a tenant       |
| POST   | `/api/onboarding/start` | Triggers onboarding for a client      |
| POST   | `/api/sync/microsoft`   | Syncs Microsoft users into local DB   |
| GET    | `/api/audit`            | Returns audit log events              |

---

## Demo Accounts

The database is pre-seeded with the following staff accounts. Use any of these emails on the login screen:

| Email                          | Role  |
|--------------------------------|-------|
| `admin@contoso.com`            | admin |
| `james.wright@contoso.com`     | staff |
| `priya.sharma@contoso.com`     | staff |

---

## Notes

- The database reseeds automatically if empty. Delete `portal.db` to reset.
- If you have been asked to review this codebase, see [`docs/CANDIDATE_INSTRUCTIONS.md`](docs/CANDIDATE_INSTRUCTIONS.md) for instructions.
