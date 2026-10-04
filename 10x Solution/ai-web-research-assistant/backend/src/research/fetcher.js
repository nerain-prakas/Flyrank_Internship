const config = require('../config');

let lastRequestAt = 0;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPage(url) {
  const wait = config.requestDelayMs - (Date.now() - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
  for (let attempt = 1; attempt <= 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(url, { headers: { 'User-Agent': config.userAgent }, signal: controller.signal });
        if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), { status: response.status });
        return await response.text();
      } catch (error) {
        if (attempt === 2 || (error.status && error.status < 500)) throw error;
        await sleep(attempt * 500);
      } finally {
        clearTimeout(timeout);
    }
  }
}

module.exports = { fetchPage };
