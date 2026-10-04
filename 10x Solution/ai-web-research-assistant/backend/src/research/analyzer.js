const OpenAI = require('openai');
const config = require('../config');

function stub(question, sources) {
  return {
    summary: `Research summary for: ${question}`,
    key_findings: sources.slice(0, 3).map(source => `Reviewed ${source.title || source.url}`),
    important_facts: ['This local development report uses deterministic stub analysis.'],
    comparison_points: [], pros: [], cons: [],
    limitations: ['The report is limited to the permitted sources collected for this job.']
  };
}

async function analyze(question, sources) {
  if (!config.llmEnabled || config.llmStub) return stub(question, sources);
  const client = new OpenAI({ apiKey: config.llmApiKey, baseURL: config.llmBaseUrl, timeout: 30000, maxRetries: 2 });
  const context = sources.map((s, i) => `[${i + 1}] ${s.title}\n${s.content}`).join('\n\n').slice(0, 50000);
  const response = await client.chat.completions.create({
    model: config.llmModel,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Return JSON with summary, key_findings, important_facts, comparison_points, pros, cons, limitations. Every list must be an array of strings.' },
      { role: 'user', content: `Question: ${question}\nSources:\n${context}` }
    ]
  });
  return JSON.parse(response.choices[0].message.content);
}

module.exports = { analyze };
