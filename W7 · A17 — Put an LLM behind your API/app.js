const express = require('express');
const { createEnrichRouter } = require('./src/routes/enrich');

function createApp() {
  const app = express();
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/enrich', createEnrichRouter());
  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'Request body must be valid JSON' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}

module.exports = { createApp };
