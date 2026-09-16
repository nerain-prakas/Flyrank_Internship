const { load } = require('cheerio');
const { z } = require('zod');

const rawRecordSchema = z.object({
  title: z.string().min(1),
  product_url: z.string().url(),
  price_text: z.string().min(1),
  availability_text: z.string().min(1),
  rating_text: z.string().nullable(),
  description: z.string().nullable(),
  source_page: z.string().url(),
  fetched_at: z.string().datetime()
});

const bookSchema = rawRecordSchema.extend({
  price_gbp: z.number().nonnegative()
});

function cleanText(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text || null;
}

function normalizePrice(priceText) {
  const match = String(priceText || '').replace(',', '').match(/\d+(?:\.\d{1,2})?/);
  if (!match) throw new Error(`Could not normalize price: ${priceText}`);
  return Number(match[0]);
}

function absoluteUrl(href, baseUrl) {
  return new URL(href, baseUrl).toString();
}

function parseCatalogue(html, pageUrl) {
  const $ = load(html);
  const links = [];
  $('article.product_pod h3 a').each((_, element) => {
    const href = $(element).attr('href');
    if (href) links.push(absoluteUrl(href, pageUrl));
  });
  const nextHref = $('li.next a').attr('href');
  return {
    bookUrls: [...new Set(links)],
    nextUrl: nextHref ? absoluteUrl(nextHref, pageUrl) : null
  };
}

function parseBook(html, productUrl, sourcePage, fetchedAt = new Date().toISOString()) {
  const $ = load(html);
  const product = $('article.product_page');
  const description = product.find('#product_description').next('p').text();
  const ratingClass = product.find('.star-rating').attr('class') || '';
  const ratingText = ratingClass.replace('star-rating', '').trim() || null;
  const raw = {
    title: cleanText(product.find('h1').first().text()),
    product_url: productUrl,
    price_text: cleanText(product.find('.price_color').first().text()),
    availability_text: cleanText(product.find('.availability').first().text()),
    rating_text: ratingText,
    description: cleanText(description),
    source_page: sourcePage,
    fetched_at: fetchedAt
  };
  const parsed = rawRecordSchema.parse(raw);
  return { ...parsed, price_gbp: normalizePrice(parsed.price_text) };
}

module.exports = {
  bookSchema,
  normalizePrice,
  absoluteUrl,
  parseCatalogue,
  parseBook
};