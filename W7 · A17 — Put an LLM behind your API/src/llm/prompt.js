const fs = require('node:fs');
const path = require('node:path');

const promptPath = path.resolve(__dirname, '../../prompts/book-enrichment-v1.md');
const systemPrompt = fs.readFileSync(promptPath, 'utf8');

function inputMessage(record) {
  return JSON.stringify({
    title: record.title,
    description: record.description ?? null,
    price_gbp: record.price_gbp,
    availability_text: record.availability_text,
    rating_text: record.rating_text ?? null
  });
}

module.exports = { promptVersion: 'book-enrichment-v1', systemPrompt, inputMessage };
