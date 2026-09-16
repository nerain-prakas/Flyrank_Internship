# W5 A9: The polite scraper

This project uses the JavaScript lane: Node.js 20+, built-in `fetch`, Cheerio, and Zod.

## Target classification

The target is [Books to Scrape](https://books.toscrape.com/), a public sandbox made for scraping practice. The scraper processes only the first three catalogue pages and the 60 book pages linked from them. It collects title, product URL, price, availability, rating, description, source page, and fetch time, then adds a numeric `price_gbp` value. This scope is appropriate because the site is explicitly a practice sandbox and the data is already present in the HTML.

I requested `https://books.toscrape.com/robots.txt` once. It returned HTTP 404, so no robots file was found. A missing file is not treated as permission for another site.

I will not reuse this code on another site without checking its rules and terms first.

## Run

```bash
npm install
npm start
```

The first run fetches and caches HTML. Later development runs read cached pages and do not contact the site. The command writes `output/books.json`, `output/errors.json`, and `output/run-report.json`. To demonstrate failure isolation without making extra real requests, run `INJECT_FAILURE=true npm start`; the fake page is recorded in `errors.json` and the valid books remain available.

## Record schema

Each stored record has `title`, `product_url`, `price_text`, `price_gbp`, `availability_text`, `rating_text`, `description`, `source_page`, and `fetched_at`. URLs are absolute HTTPS URLs. Descriptions can be `null`. Every record is validated with Zod before it enters `books.json`; invalid records are written to `errors.json`.

## Politeness and reliability

- Requests identify themselves with `FlyRankInternship-A9/1.0`.
- Real requests wait at least 500 ms apart and have an 8-second timeout.
- Catalogue and detail HTML is cached locally; cached reads do not cause network requests.
- HTTP status is checked before parsing. Timeouts and 5xx responses are retried once; 403 and 404 responses are not retried.
- Each detail page is isolated, so one failed page does not stop the run.
- URLs are canonical record identities, so reruns are idempotent and cannot duplicate records.

## Tests

```bash
npm test
```

The parser tests cover price normalization, relative-to-absolute URLs, missing descriptions, duplicate URLs, and malformed input without using the network.

## Evidence

Example successful report shape:

```json
{
  "catalogue_pages": 3,
  "discovered": 60,
  "unique_urls": 60,
  "detail_pages": 60,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 0
}
```

This assignment does not need a browser: the book data is already in the HTML sent by the server, so browser automation would add cost without adding information. The ethical boundary is simple: use an official API when one exists, never bypass logins, paywalls, or blocks, and collect only what is needed.