require('dotenv').config();

const integer = (name, fallback) => {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

module.exports = {
  port: integer('PORT', 3000),
  databaseUrl: process.env.DATABASE_URL,
  devAuthToken: process.env.DEV_AUTH_TOKEN || 'local-development-token',
  maxSources: Math.max(1, integer('MAX_SOURCES', 5)),
  requestDelayMs: integer('REQUEST_DELAY_MS', 500),
  cacheTtlSeconds: integer('CACHE_TTL_SECONDS', 86400),
  userAgent: process.env.USER_AGENT || 'FlyRankResearchAssistant/1.0',
  llmEnabled: process.env.LLM_ENABLED !== 'false',
  llmStub: process.env.LLM_STUB === '1',
  llmApiKey: process.env.LLM_API_KEY,
  llmBaseUrl: process.env.LLM_BASE_URL,
  llmModel: process.env.LLM_MODEL || 'gemma3:1b'
};
