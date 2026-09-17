const test = require('node:test');
const assert = require('node:assert/strict');
const { extractJson, validateModelOutput } = require('../src/llm/parse');
const { enrichInputSchema } = require('../src/llm/schema');

const valid = { category: 'fiction', summary: 'A short fictional story.', quality_flags: ['none'], confidence: 0.9 };

test('extracts JSON from a fenced model response', () => {
  assert.deepEqual(extractJson(`Here is the result:\n\`\`\`json\n${JSON.stringify(valid)}\n\`\`\``), valid);
});

test('rejects unknown categories and extra fields', () => {
  const result = validateModelOutput(JSON.stringify({ ...valid, category: 'poetry', extra: true }));
  assert.equal(result.success, false);
});

test('accepts a complete W5-shaped record and validates required fields', () => {
  const result = enrichInputSchema.safeParse({
    title: 'A book', description: null, price_gbp: 12, availability_text: 'In stock', rating_text: 'Four',
    product_url: 'https://books.toscrape.com/book', source_page: 'https://books.toscrape.com/', fetched_at: new Date().toISOString()
  });
  assert.equal(result.success, true);
});

test('rejects missing title with a field issue', () => {
  const result = enrichInputSchema.safeParse({ price_gbp: 12, availability_text: 'In stock' });
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.path[0] === 'title'));
});
