const fs = require('node:fs/promises');
const path = require('node:path');

async function run() {
  const cases = JSON.parse(await fs.readFile(path.resolve(__dirname, '../evals/cases.json'), 'utf8'));
  const baseUrl = process.env.EVAL_URL || 'http://localhost:3000/enrich';
  let matched = 0;
  const failures = [];
  for (const testCase of cases) {
    const response = await fetch(baseUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(testCase.input) });
    const result = await response.json();
    if (response.ok && result.category === testCase.expected_category) matched += 1;
    else failures.push({ name: testCase.name, expected: testCase.expected_category, received: result.category || result.error });
  }
  console.log(`category score: ${matched}/${cases.length} (${Math.round(matched / cases.length * 100)}%)`);
  if (failures.length) console.log(JSON.stringify(failures, null, 2));
}

run().catch(error => { console.error(error.message); process.exitCode = 1; });
