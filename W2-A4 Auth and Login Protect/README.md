# Auth Protected API

Express API for the FlyRank Backend Track W2-A4 assignment. Supabase Auth manages user accounts, passwords, sessions, and JWTs. This API verifies bearer tokens before serving protected routes.

## What is included

- User signup and login through Supabase Auth
- Reusable bearer-token authentication middleware
- Protected profile, dashboard, and logout routes
- Public information route
- Swagger UI with an **Authorize** bearer-token control
- Environment-based configuration with `.env` excluded from Git

## Project structure

```text
app.js                         Express application and public routes
controllers/authController.js  Signup, login, logout, profile, dashboard
middleware/auth.js             Shared Supabase token verification
routes/auth.js                 Authentication and protected route mapping
swagger/swagger.json            OpenAPI documentation and bearer security
```

## Setup

Prerequisites: Node.js 20+ and a Supabase project.

1. In Supabase, open **Project Settings -> API** and copy the project URL and publishable anon key.
2. In Supabase, open **Authentication -> Sign In / Providers -> Email** and turn off email confirmation for local practice.
3. Create `.env` from `.env.example` and add your values:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

Never use or commit the `service_role` key. The application only needs the publishable anon key. `.env` is ignored by Git.

## Run

```bash
npm install
npm start
```

The API runs at `http://localhost:3000`. Interactive Swagger documentation is at `http://localhost:3000/docs`.

## Authentication flow

1. `POST /auth/signup` sends the email and password to Supabase.
2. `POST /auth/login` returns an `access_token` and `refresh_token`.
3. The client sends the access token as `Authorization: Bearer <token>`.
4. The middleware calls Supabase `auth.getUser(token)` and attaches the verified user to `req.user`.
5. Protected handlers run only after verification succeeds.

Passwords are never stored or hashed by this API.

## API reference

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| POST | `/auth/signup` | Create a user | None |
| POST | `/auth/login` | Return access and refresh tokens | None |
| POST | `/auth/logout` | End the current session | Bearer token |
| GET | `/protected/profile` | Read safe user metadata | Bearer token |
| GET | `/protected/dashboard` | Read protected dashboard data | Bearer token |
| GET | `/public/info` | Read public information | None |
| GET | `/docs` | Open Swagger UI | None |

## Response codes

| Code | Meaning | Used for |
| --- | --- | --- |
| 200 | OK | Successful login and reads |
| 201 | Created | Successful signup |
| 204 | No Content | Successful logout |
| 400 | Bad Request | Missing signup/login fields or rejected signup |
| 401 | Unauthorized | Missing, malformed, expired, or invalid token; invalid login |

`401` means the request is not authenticated. A future authorization-only rule would use `403` when the user is known but not allowed.

## Checkpoints

Sign up:

```bash
curl -i -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Log in and copy the `access_token` from the response:

```bash
curl -i -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Call a protected route:

```bash
curl -i http://localhost:3000/protected/profile -H "Authorization: Bearer PASTE_ACCESS_TOKEN_HERE"
```

Expected behavior:

- Missing or malformed bearer header: `401 { "error": "Access token required" }`
- Tampered, expired, or rejected token: `401 { "error": "Invalid or expired token" }`
- Valid token: `200` with the user's id, email, and account-created date
- Missing email or password: `400`
- Successful logout: `204`

In Swagger UI, select **Authorize**, enter the JWT, and use **Try it out** on the protected routes.

## Validation checklist

- [x] Server starts with `npm start`.
- [x] `.env` is ignored and `.env.example` contains placeholders only.
- [x] Public route returns `200`.
- [x] Protected routes reject missing or malformed tokens with `401`.
- [x] Signup and login validate missing fields with `400`.
- [x] Auth middleware is reused by profile, dashboard, and logout.
- [x] Swagger UI is available at `/docs` and protected operations declare bearer security.
- [ ] Complete live signup/login/profile verification after confirming this machine can reach Supabase.

## Troubleshooting

If signup or login returns `fetch failed`, check that:

1. The Supabase project is running.
2. `SUPABASE_URL` is the project URL from **Project Settings -> API**.
3. `SUPABASE_ANON_KEY` is the publishable anon key, not `service_role`.
4. The current network, VPN, firewall, or proxy allows HTTPS access to Supabase.
5. Email confirmation is disabled for local practice, or the signup email has been confirmed.

## Git and submission safety

Before publishing, run:

```bash
git status --short
git check-ignore .env
git log --oneline
```

`.env` must not appear in `git status`, and `git check-ignore .env` should print `.env`. Never include real Supabase keys in the repository, README, screenshots, or commit history.

The optional AI rematch stage can be kept in a separate `ai-version/` folder or branch so the hand-built implementation remains unchanged.