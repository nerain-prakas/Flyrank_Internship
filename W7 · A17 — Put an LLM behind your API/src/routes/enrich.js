const { Router } = require('express');
const { enrichInputSchema, enrichOutputSchema, stubResult } = require('../llm/schema');
const { complete } = require('../llm/client');
const { validateModelOutput } = require('../llm/parse');
const { logQuarantine } = require('../llm/logger');
const { promptVersion } = require('../llm/prompt');

function fallbackResult() {
  return {
    category: 'other',
    summary: 'Book enrichment is currently disabled.',
    quality_flags: ['none'],
    confidence: 0.1
  };
}

function validationMessage(result) {
  return result.error.issues.map(issue => `${issue.path.join('.') || 'record'}: ${issue.message}`).join('; ');
}

function createEnrichRouter() {
  const router = Router();
  router.post('/', async (req, res) => {
    const input = enrichInputSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Invalid book record', fields: validationMessage(input) });

    if (process.env.LLM_ENABLED === 'false') return res.json(fallbackResult());
    if (process.env.LLM_STUB === '1') return res.json(enrichOutputSchema.parse(stubResult));

    let firstResponse;
    try {
      firstResponse = await complete(input.data, null);
    } catch (error) {
      const status = Number(error?.status || 0);
      if (error?.name === 'TimeoutError' || error?.code === 'ETIMEDOUT' || error?.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'The model provider timed out' });
      }
      if (status === 401 || status === 403) return res.status(502).json({ error: 'The model provider rejected the configured credentials' });
      return res.status(502).json({ error: 'The model provider is unavailable' });
    }

    let parsed = validateModelOutput(firstResponse.content);
    if (!parsed.success) {
      let repairResponse;
      try {
        repairResponse = await complete(input.data, { raw: firstResponse.content, error: parsed.error });
      } catch (error) {
        await logQuarantine({ input: input.data, raw_output: firstResponse.content, error: error.message, prompt_version: promptVersion });
        return res.status(422).json({ error: 'The model output could not be repaired' });
      }
      parsed = validateModelOutput(repairResponse.content);
      if (!parsed.success) {
        await logQuarantine({ input: input.data, raw_output: repairResponse.content, first_error: parsed.error, prompt_version: promptVersion });
        return res.status(422).json({ error: 'The model output did not match the required schema' });
      }
    }
    return res.json(parsed.data);
  });
  return router;
}

module.exports = { createEnrichRouter, fallbackResult };
