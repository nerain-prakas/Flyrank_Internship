# AI Web Research Assistant

A portfolio-quality FlyRank capstone that queues source-backed web research, extracts readable content, analyzes it through a configurable OpenAI-compatible LLM (including local Ollama), and produces a structured report and PDF.

## Features

- Express REST API with bearer authentication
- PostgreSQL persistence for users, projects, sources, reports, and citations
- Background research worker that does not block the create request
- Polite fetching with user-agent, delay, timeout, retry, bounded source count, and content limits
- Cheerio extraction and normalization
- Deterministic local LLM stub for free, offline development
- OpenAI-compatible provider configuration for Ollama or hosted providers
- Swagger UI at `/docs`
- PDF report download
- Lightweight browser frontend
- Docker Compose for PostgreSQL and the API

## Run locally

```powershell
cd "10x Solution\ai-web-research-assistant\backend"
Copy-Item .env.example .env
npm install
```

Start PostgreSQL and initialize `backend/src/database/schema.sql`, then:

```powershell
npm start
```

For the simplest complete setup:

```powershell
docker compose up --build
```

Open `frontend/index.html` and use the local token `local-development-token`. Set Supabase variables to use real Supabase access tokens; when they are configured, the development token is disabled.

## API

All `/api` routes require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/research` | Validate and queue `{ "question": "...", "urls": [] }` |
| GET | `/api/research` | List the authenticated user's projects |
| GET | `/api/research/:id/status` | Read queued/researching/analyzing/completed/failed status |
| GET | `/api/research/:id/sources` | List collected sources |
| GET | `/api/research/:id/report` | Read the structured report |
| GET | `/api/research/:id/report/pdf` | Download the report as PDF |
| DELETE | `/api/research/:id` | Delete an owned project |

## Architecture

`POST /api/research` persists a queued project and schedules `runResearch` with `setImmediate`. The worker fetches only explicit URLs (or a bounded Wikipedia fallback), parses and limits content, stores source metadata, calls the analyzer, stores the report and citations, and transitions the project to `completed` or `failed`.

The current cache boundary is the PostgreSQL `source_contents` table. The first implementation stores source metadata and content hashing; the next milestone should add cache read/write checks before fetching. This keeps cache invalidation and ownership data in the same database without introducing Redis prematurely.

## Security and limitations

The implementation does not bypass robots controls, CAPTCHAs, paywalls, or authentication. A production discovery service should add a robots.txt client before accepting arbitrary discovered URLs. The local frontend intentionally uses a development token and must not be deployed unchanged. Reports are bounded and should be treated as research assistance, not authoritative advice.

## FlyRank 10x mapping

REST, validation, error handling, auth, PostgreSQL, scraper/parser, retry and timeout behavior, LLM abstraction, background processing, PDF generation, Swagger, tests, and Docker are represented by the corresponding `backend/src` modules and Compose services.
