# W7 A17: Book enrichment behind an API

This project adds `POST /enrich` to the W5 scraper workflow. It accepts one normalized Books to Scrape record and asks an LLM to classify the book into a small closed list, write a short summary, and report quality flags. The API never returns model prose directly: the response is parsed and validated before it leaves the endpoint.

## Run without a provider

Node.js 20+ is required.

```bash
npm install
copy .env.example .env
npm test
npm start
```

`LLM_STUB=1` returns a valid deterministic response without making a model call. `LLM_ENABLED=false` is the kill switch and returns a safe fallback immediately. The W5 full record can be posted directly; unknown fields are ignored after the required enrichment fields are validated.

```bash
curl -X POST http://localhost:3000/enrich -H "Content-Type: application/json" -d "{\"title\":\"A practical guide to astronomy\",\"description\":\"A non-fiction guide to stars and planets.\",\"price_gbp\":20,\"availability_text\":\"In stock\",\"rating_text\":\"Five\"}"
```

With stub mode enabled, the exact response is:

```json
{"category":"other","summary":"The book was not classified because stub mode is enabled.","quality_flags":["none"],"confidence":0.1}
```

A deliberately invalid request returns HTTP 400 and names the field:

```bash
curl -X POST http://localhost:3000/enrich -H "Content-Type: application/json" -d "{\"price_gbp\":\"free\"}"
```

## Job card

- **Job:** enrich a scraped book record.
- **Input:** title, optional description, price, availability, and optional rating.
- **Output:** category (`fiction`, `non-fiction`, `children`, `other`), one-sentence summary, quality flags, and confidence from 0 to 1.
- **Never:** invent categories, add fields, return raw model text, or provide advice.
- **Unsure:** use `other` and confidence below 0.5.

## Provider configuration

The implementation uses the OpenAI-compatible client. Ollama is the default example because it is local and costs nothing. OpenRouter works without code changes by changing these three variables:

```dotenv
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=your-key
LLM_MODEL=openrouter/free
```

The client uses a 30-second timeout and explicitly disables the SDK's automatic retries (`maxRetries: 0`). The application retries only timeouts, 429, and 5xx responses, with exponential backoff and jitter. 400, 401, and 403 fail without retrying. Usage is written as JSONL to `logs/llm-usage.jsonl`.

The prompt is versioned in [prompts/book-enrichment-v1.md](prompts/book-enrichment-v1.md). User data is JSON-encoded in a separate user message. A malformed or invalid answer receives exactly one repair request; if it still fails, the raw answer and reason are quarantined in `logs/quarantine.jsonl` and the API returns 422. Timeout errors return 504.

## Eval

The eight hand-labelled cases are in `evals/cases.json`. Run the API with `LLM_STUB=1` for a zero-cost contract check, then run:

```bash
npm run eval
```

The stub intentionally scores `0/8`; it verifies plumbing, not model quality. Record a real provider score here after running the eval: **not run in this environment; prompt version `book-enrichment-v1`; date 2026-09-17**.

## Cost and next step

A usage log line records prompt version, model, input tokens, output tokens, duration, and whether the call was a repair. Ollama is local, so its API cost is $0; OpenRouter cost depends on the selected model. For 10,000 requests per day, the largest cost driver is retries and output tokens, so the schema and one-repair limit keep the budget bounded.

With another day I would add a provider interface for a second implementation, a cache keyed by the input plus prompt version, and five prompt-injection cases to the eval set.
