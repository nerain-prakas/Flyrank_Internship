const { z } = require('zod');

const createResearchSchema = z.object({
  question: z.string().trim().min(10).max(2000),
  urls: z.array(z.string().url()).max(10).optional()
}).strict();

module.exports = { createResearchSchema };
