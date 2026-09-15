# Auth Protected API

Express API for FlyRank Backend Track W2-A4. Supabase Auth manages users and issues JWTs; the API verifies bearer tokens before serving protected routes.

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

Never use or commit the `service_role` key. `.env` is ignored by Git.

## Run

```bash
npm install
npm start
```

The API runs at `http://localhost:3000`. Interactive Swagger documentation is at `http://localhost:3000/docs`.

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