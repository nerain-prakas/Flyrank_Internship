module.exports = {
  openapi: '3.0.3',
  info: { title: 'AI Web Research Assistant API', version: '1.0.0' },
  servers: [{ url: '/api' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
  paths: {
    '/research': {
      post: { security: [{ bearerAuth: [] }], summary: 'Queue a research job', responses: { 202: { description: 'Job queued' } } },
      get: { security: [{ bearerAuth: [] }], summary: 'List your research projects', responses: { 200: { description: 'Projects' } } }
    },
    '/research/{id}/status': { get: { security: [{ bearerAuth: [] }], summary: 'Get job status', responses: { 200: { description: 'Status' } } } },
    '/research/{id}/report': { get: { security: [{ bearerAuth: [] }], summary: 'Get report', responses: { 200: { description: 'Report' } } } },
    '/research/{id}/report/pdf': { get: { security: [{ bearerAuth: [] }], summary: 'Download PDF', responses: { 200: { description: 'PDF' } } } }
  }
};
