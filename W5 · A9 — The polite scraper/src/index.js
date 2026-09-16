const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { parseCatalogue, parseBook, bookSchema } = require('./parser');

const BASE_URL = 'https://books.toscrape.com/';
const USER_AGENT = 'FlyRankInternship-A9/1.0 (+https://github.com/flyrank-internship)';
const DELAY_MS = 500;
const TIMEOUT_MS = 8000;
const root = path.resolve(__dirname, '..');
const cacheDir = path.join(root, 'cache');
const outputDir = path.join(root, 'output');

const stats = { pages_fetched: 0, cache_hits: 0, failed_pages: 0 };
let lastRequestAt = 0;

class FetchError extends Error {
  constructor(message, status = null) {
    super(message);
    this.status = status;
  }
}

function cacheName(url) {
  return `${crypto.createHash('sha1').update(url).digest('hex')}.html`;
}

async function waitBetweenRequests() {
  const wait = DELAY_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

async function request(url) {
  await waitBetweenRequests();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: controller.signal });
    if (!response.ok) throw new FetchError(`HTTP ${response.status} for ${url}`, response.status);
    stats.pages_fetched += 1;
    return await response.text();
  } catch (error) {
    if (error.name === 'AbortError') throw new FetchError(`Timeout fetching ${url}`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function getPage(url, label) {
  const filePath = path.join(cacheDir, label || cacheName(url));
  try {
    const html = await fs.readFile(filePath, 'utf8');
    stats.cache_hits += 1;
    return { html, cached: true };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const html = await request(url);
      await fs.writeFile(filePath, html);
      return { html, cached: false };
    } catch (error) {
      lastError = error;
      const retryable = error.status === null || (error.status >= 500 && error.status <= 599);
      if (!retryable || attempt === 2) break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
}

async function discoverCataloguePages() {
  const pages = [];
  let pageUrl = BASE_URL;
  for (let pageNumber = 0; pageNumber < 3; pageNumber += 1) {
    const page = await getPage(pageUrl, `catalogue-page-${pageNumber + 1}.html`);
    pages.push({ url: pageUrl, html: page.html });
    const parsed = parseCatalogue(page.html, pageUrl);
    if (pageNumber < 2 && !parsed.nextUrl) throw new Error('Catalogue ended before three pages were found');
    pageUrl = parsed.nextUrl;
  }
  return pages;
}

async function run() {
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  const startedAt = new Date();
  const errors = [];
  const booksByUrl = new Map();
  let cataloguePages;
  try {
    cataloguePages = await discoverCataloguePages();
  } catch (error) {
    errors.push({ url: BASE_URL, reason: error.message });
    stats.failed_pages += 1;
    cataloguePages = [];
  }

  const discoveredUrls = [];
  for (const page of cataloguePages) {
    discoveredUrls.push(...parseCatalogue(page.html, page.url).bookUrls.map(productUrl => ({ productUrl, sourcePage: page.url })));
  }
  const uniqueBooks = new Map(discoveredUrls.map(item => [item.productUrl, item]));
  if (process.env.INJECT_FAILURE === 'true') uniqueBooks.set(`${BASE_URL}missing-book/index.html`, { productUrl: `${BASE_URL}missing-book/index.html`, sourcePage: BASE_URL });

  for (const { productUrl, sourcePage } of uniqueBooks.values()) {
    try {
      const page = await getPage(productUrl, `detail-${cacheName(productUrl)}`);
      const book = parseBook(page.html, productUrl, sourcePage);
      booksByUrl.set(productUrl, bookSchema.parse(book));
    } catch (error) {
      stats.failed_pages += 1;
      errors.push({ url: productUrl, reason: error.message, status: error.status || undefined });
    }
  }

  const books = [...booksByUrl.values()];
  await fs.writeFile(path.join(outputDir, 'books.json'), `${JSON.stringify(books, null, 2)}\n`);
  await fs.writeFile(path.join(outputDir, 'errors.json'), `${JSON.stringify(errors, null, 2)}\n`);
  const finishedAt = new Date();
  const report = {
    started_at: startedAt.toISOString(),
    finished_at: finishedAt.toISOString(),
    duration_ms: finishedAt - startedAt,
    catalogue_pages: cataloguePages.length,
    discovered: discoveredUrls.length,
    unique_urls: uniqueBooks.size,
    detail_pages: uniqueBooks.size,
    ...stats,
    valid_records: books.length,
    invalid_records: errors.length,
    failed_pages: stats.failed_pages
  };
  await fs.writeFile(path.join(outputDir, 'run-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`catalogue_pages=${report.catalogue_pages} discovered=${report.discovered} unique_urls=${report.unique_urls}`);
  console.log(`detail_pages=${report.detail_pages} valid_records=${report.valid_records} failed_pages=${report.failed_pages}`);
  console.log(`fetched=${report.pages_fetched} cache_hits=${report.cache_hits}`);
  if (books[0]) console.log(JSON.stringify(books[0], null, 2));
}

if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });

module.exports = { normalizePrice: require('./parser').normalizePrice, parseCatalogue, parseBook };