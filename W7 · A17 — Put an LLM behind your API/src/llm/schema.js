const { z } = require('zod');

const enrichInputSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(4000).nullable().optional(),
  price_gbp: z.number().finite().nonnegative(),
  availability_text: z.string().trim().min(1).max(200),
  rating_text: z.string().trim().max(30).nullable().optional()
});

const enrichOutputSchema = z.object({
  category: z.enum(['fiction', 'non-fiction', 'children', 'other']),
  summary: z.string().trim().min(1).max(240),
  quality_flags: z.array(z.enum(['missing_description', 'low_rating', 'expensive', 'none'])).max(3),
  confidence: z.number().min(0).max(1)
}).strict();

const stubResult = {
  category: 'other',
  summary: 'The book was not classified because stub mode is enabled.',
  quality_flags: ['none'],
  confidence: 0.1
};

module.exports = { enrichInputSchema, enrichOutputSchema, stubResult };
