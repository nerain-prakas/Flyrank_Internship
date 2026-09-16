const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizePrice, absoluteUrl, parseCatalogue, parseBook } = require('../src/parser');

test('normalizes a pound price to a number', () => assert.equal(normalizePrice('£51.77'), 51.77));
test('resolves relative URLs against the catalogue URL', () => assert.equal(absoluteUrl('../book/item/index.html', 'https://books.toscrape.com/catalogue/page-1.html'), 'https://books.toscrape.com/book/item/index.html'));
test('extracts catalogue links and the next page', () => {
  const html = '<article class="product_pod"><h3><a href="../book/a/index.html">A</a></h3></article><li class="next"><a href="page-2.html">next</a></li>';
  const result = parseCatalogue(html, 'https://books.toscrape.com/catalogue/page-1.html');
  assert.deepEqual(result.bookUrls, ['https://books.toscrape.com/book/a/index.html']);
  assert.equal(result.nextUrl, 'https://books.toscrape.com/catalogue/page-2.html');
});
test('keeps a missing description as null', () => {
  const html = '<article class="product_page"><h1>Book</h1><p class="price_color">£10.00</p><p class="availability">In stock</p><div class="star-rating One"></div></article>';
  assert.equal(parseBook(html, 'https://example.com/book', 'https://example.com/catalogue', '2026-01-01T00:00:00.000Z').description, null);
});
test('removes duplicate catalogue URLs', () => {
  const html = '<article class="product_pod"><h3><a href="book.html">A</a></h3></article><article class="product_pod"><h3><a href="book.html">A</a></h3></article>';
  assert.equal(parseCatalogue(html, 'https://example.com/catalogue/').bookUrls.length, 1);
});
test('rejects malformed book fixtures', () => {
  assert.throws(() => parseBook('<article class="product_page"><h1>Broken</h1></article>', 'not-a-url', 'also-not-a-url'));
});