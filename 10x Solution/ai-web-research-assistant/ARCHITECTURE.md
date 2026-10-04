# Architecture

```text
Browser -> Express API -> Auth middleware -> PostgreSQL
                              |
                              +-> Background research worker
                                    -> polite fetcher -> Cheerio parser
                                    -> LLM analyzer -> report + citations
                                    -> PDF renderer
```

The API owns authorization and project lifecycle. The worker owns external I/O and status transitions. PostgreSQL is the source of truth for project state, source metadata, report data, and citation relationships.

## Milestones

1. Foundation: schema, API, auth, worker, stub LLM, Docker.
2. Research quality: robots.txt checks, URL discovery adapter, source-content cache.
3. Product UX: authenticated frontend, progress polling, report sections, PDF download.
4. Verification: database integration tests, external-I/O mocks, security and load review.
