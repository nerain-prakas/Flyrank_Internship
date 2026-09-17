const OpenAI = require('openai');
const { logUsage } = require('./logger');
const { promptVersion, systemPrompt, inputMessage } = require('./prompt');

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const timeoutMs = 30000;

function makeClient() {
  return new OpenAI({
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_BASE_URL,
    timeout: timeoutMs,
    maxRetries: 0
  });
}

function statusOf(error) { return Number(error?.status || error?.response?.status || 0); }
function isTimeout(error) { return error?.name === 'TimeoutError' || error?.code === 'ETIMEDOUT' || error?.code === 'ECONNABORTED'; }
function shouldRetry(error) { return isTimeout(error) || RETRYABLE_STATUS.has(statusOf(error)); }

function retryDelay(error, attempt) {
  const retryAfter = error?.headers?.get?.('retry-after') || error?.headers?.['retry-after'];
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 10000);
  return Math.min(1000 * (2 ** (attempt - 1)) + Math.floor(Math.random() * 250), 10000);
}

async function complete(record, repair) {
  const client = makeClient();
  const userContent = repair
    ? `${inputMessage(record)}\n\nPrevious rejected output:\n${repair.raw}\n\nValidation error:\n${repair.error}\n\nYour previous answer was rejected. Return only corrected JSON matching the schema.`
    : inputMessage(record);
  const startedAt = Date.now();
  let response;
  let attempts = 0;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    attempts = attempt;
    try {
      response = await client.chat.completions.create({
        model: process.env.LLM_MODEL,
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ]
      });
      break;
    } catch (error) {
      if (!shouldRetry(error) || attempt === 3) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelay(error, attempt)));
    }
  }
  const content = response?.choices?.[0]?.message?.content || '';
  const usage = response?.usage || {};
  await logUsage({
    prompt_version: promptVersion,
    model: process.env.LLM_MODEL || 'unset',
    input_tokens: usage.prompt_tokens ?? usage.input_tokens ?? null,
    output_tokens: usage.completion_tokens ?? usage.output_tokens ?? null,
    duration_ms: Date.now() - startedAt,
    repair: Boolean(repair),
    provider_attempts: attempts
  });
  return { content };
}

module.exports = { complete, shouldRetry, timeoutMs };
