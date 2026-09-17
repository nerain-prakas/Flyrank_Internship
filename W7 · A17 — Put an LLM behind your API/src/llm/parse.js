const { enrichOutputSchema } = require('./schema');

function extractJson(text) {
  const value = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = value.indexOf('{');
  const end = value.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Model response did not contain a JSON object');
  return JSON.parse(value.slice(start, end + 1));
}

function validateModelOutput(text) {
  let parsed;
  try {
    parsed = extractJson(text);
  } catch (error) {
    return { success: false, error: error.message };
  }
  const result = enrichOutputSchema.safeParse(parsed);
  if (!result.success) return { success: false, error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ') };
  return { success: true, data: result.data };
}

module.exports = { extractJson, validateModelOutput };
