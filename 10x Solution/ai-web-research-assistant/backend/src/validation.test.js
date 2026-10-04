const { createResearchSchema } = require('./validation');

test('rejects questions that are too short', () => {
  expect(() => createResearchSchema.parse({ question: 'short' })).toThrow();
});

test('accepts a bounded question and URLs', () => {
  expect(createResearchSchema.parse({ question: 'Compare PostgreSQL and MySQL', urls: ['https://example.test'] })).toEqual({
    question: 'Compare PostgreSQL and MySQL', urls: ['https://example.test']
  });
});
