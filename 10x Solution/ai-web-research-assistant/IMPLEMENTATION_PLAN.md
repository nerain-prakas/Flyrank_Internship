# Implementation plan

## Milestone 1 — runnable foundation

- [x] Preserve weekly assignments and create an isolated capstone folder.
- [x] Add PostgreSQL relational schema and indexes.
- [x] Add authenticated REST endpoints with Zod validation.
- [x] Add bounded, polite fetch and Cheerio extraction.
- [x] Add background status transitions and deterministic LLM stub.
- [x] Add Swagger, PDF output, Docker Compose, and a starter UI.

## Milestone 2 — research correctness

- [x] Implement robots.txt fetch/cache and deny crawling when disallowed.
- [ ] Add source-content cache reads and TTL expiry.
- [ ] Add a configurable discovery provider rather than relying on the Wikipedia fallback.
- [ ] Add transactional worker writes and an explicit retry/dead-letter policy.

## Milestone 3 — production readiness

- [ ] Replace local token UI flow with Supabase login.
- [ ] Add migrations and a health/readiness split.
- [ ] Add integration tests against disposable PostgreSQL.
- [ ] Add structured logging, rate limiting, and observability.
