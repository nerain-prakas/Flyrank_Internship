const fs = require('node:fs/promises');
const path = require('node:path');

const logDir = path.resolve(__dirname, '../../logs');
const usagePath = path.join(logDir, 'llm-usage.jsonl');
const quarantinePath = path.join(logDir, 'quarantine.jsonl');

async function appendJsonLine(filePath, value) {
  await fs.mkdir(logDir, { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(value)}\n`);
}

function logUsage(value) { return appendJsonLine(usagePath, value); }
function logQuarantine(value) { return appendJsonLine(quarantinePath, value); }

module.exports = { logUsage, logQuarantine };
