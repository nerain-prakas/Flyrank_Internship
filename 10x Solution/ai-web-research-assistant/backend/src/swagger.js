
module.exports = {
  openapi: '3.0.3',

  info: {
    title: 'AI Web Research Assistant API',
    version: '1.0.0',
    description: 'API for source-backed web research and report generation.'
  },

  servers: [{ url: '/api' }],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },

  paths: {
    '/research': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Queue a research job',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['question'],
                additionalProperties: false,
                properties: {
                  question: {
                    type: 'string',
                    minLength: 10,
                    maxLength: 2000,
                    example: 'What are the latest applications of AI in healthcare?'
                  },
                  urls: {
                    type: 'array',
                    maxItems: 10,
                    items: {
                      type: 'string',
                      format: 'uri'
                    },
                    example: [
                      'https://en.wikipedia.org/wiki/Artificial_intelligence'
                    ]
                  }
                }
              }
            }
          }
        },
        responses: {
          202: { description: 'Job queued successfully' },
          400: { description: 'Validation failed' },
          401: { description: 'Unauthorized' }
        }
      },

      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List your research projects',
        responses: {
          200: { description: 'Projects retrieved' }
        }
      }
    },

    '/research/{id}/status': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Get job status',
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }],
        responses: {
          200: { description: 'Status retrieved' },
          404: { description: 'Project not found' }
        }
      }
    },

    '/research/{id}/sources': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Get collected sources',
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }],
        responses: {
          200: { description: 'Sources retrieved' },
          404: { description: 'Project not found' }
        }
      }
    },

    '/research/{id}/report': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Get research report',
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }],
        responses: {
          200: { description: 'Report retrieved' },
          404: { description: 'Report not ready or project not found' }
        }
      }
    },

    '/research/{id}/report/pdf': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Download research PDF',
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }],
        responses: {
          200: {
            description: 'PDF report',
            content: {
              'application/pdf': {
                schema: { type: 'string', format: 'binary' }
              }
            }
          }
        }
      }
    },

    '/research/{id}': {
      delete: {
        security: [{ bearerAuth: [] }],
        summary: 'Delete a research project',
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }],
        responses: {
          204: { description: 'Project deleted' },
          404: { description: 'Project not found' }
        }
      }
    }
  }
};
