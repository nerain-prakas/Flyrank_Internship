const crypto = require('node:crypto');
const pool = require('../database/pool');
const config = require('../config');
const { fetchPage } = require('./fetcher');
const { parseHtml } = require('./parser');
const { analyze } = require('./analyzer');
const { allowedByRobots } = require('./robots');

function sourceUrls(question, urls) {
  if (urls?.length) return urls.slice(0, config.maxSources);
  return [`https://en.wikipedia.org/wiki/${encodeURIComponent(question.replace(/\s+/g, '_'))}`];
}

async function runResearch(projectId, question, urls = []) {
  const client = await pool.connect();
  try {
    await client.query('UPDATE research_projects SET status=$1, updated_at=now() WHERE id=$2', ['researching', projectId]);
    const sources = [];
    for (const url of sourceUrls(question, urls)) {
      try {
        if (!(await allowedByRobots(url))) throw new Error('Blocked by robots.txt');
        const parsed = parseHtml(await fetchPage(url), url);
        const id = crypto.randomUUID();
        await client.query(
          'INSERT INTO sources(id, project_id, url, title, fetched_at, content_hash) VALUES($1,$2,$3,$4,now(),$5)',
          [id, projectId, url, parsed.title, crypto.createHash('sha256').update(parsed.content).digest('hex')]
        );
        sources.push({ id, url, ...parsed });
      } catch (error) {
        console.warn(`Source skipped (${url}): ${error.message}`);
      }
    }
    await client.query('UPDATE research_projects SET status=$1, updated_at=now() WHERE id=$2', ['analyzing', projectId]);
    const report = await analyze(question, sources);
    const reportId = crypto.randomUUID();
    await client.query(
      'INSERT INTO research_reports(id, project_id, summary, key_findings, important_facts, comparison_points, pros, cons, limitations) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [reportId, projectId, report.summary, report.key_findings, report.important_facts, report.comparison_points, report.pros, report.cons, report.limitations]
    );
    for (const source of sources) {
      await client.query('INSERT INTO research_citations(id, report_id, source_id, claim) VALUES($1,$2,$3,$4)', [crypto.randomUUID(), reportId, source.id, 'Source reviewed for this report']);
    }
    await client.query('UPDATE research_projects SET status=$1, updated_at=now() WHERE id=$2', ['completed', projectId]);
  } catch (error) {
    await client.query('UPDATE research_projects SET status=$1, error_message=$2, updated_at=now() WHERE id=$3', ['failed', error.message, projectId]);
  } finally {
    client.release();
  }
}

module.exports = { runResearch };
