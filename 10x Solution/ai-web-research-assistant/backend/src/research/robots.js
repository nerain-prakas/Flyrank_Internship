const { URL } = require('node:url');
const config = require('../config');

const robotsCache = new Map();

async function allowedByRobots(targetUrl) {
  const target = new URL(targetUrl);
  const robotsUrl = `${target.origin}/robots.txt`;
  let rules = robotsCache.get(robotsUrl);
  if (!rules || rules.expiresAt < Date.now()) {
    const response = await fetch(robotsUrl, { headers: { 'User-Agent': config.userAgent } });
    rules = { text: response.ok ? await response.text() : '', expiresAt: Date.now() + 3600000 };
    robotsCache.set(robotsUrl, rules);
  }
  const disallowed = rules.text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => /^disallow:/i.test(line))
    .map(line => line.slice(line.indexOf(':') + 1).trim())
    .filter(Boolean);
  return !disallowed.some(path => target.pathname.startsWith(path));
}

module.exports = { allowedByRobots };
