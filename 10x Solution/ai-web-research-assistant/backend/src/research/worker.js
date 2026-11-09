
const crypto = require('node:crypto');
const pool = require('../database/pool');
const config = require('../config');
const { fetchPage } = require('./fetcher');
const { parseHtml } = require('./parser');
const { analyze } = require('./analyzer');
const { allowedByRobots } = require('./robots');

function sourceUrls(question, urls) {
  if (urls?.length) {
    return urls.slice(0, config.maxSources);
  }

  return [
    `https://en.wikipedia.org/wiki/${encodeURIComponent(
      question.replace(/\s+/g, '_')
    )}`
  ];
}

// Ensure values sent to PostgreSQL JSONB columns are valid JSON.
function toJson(value) {
  return JSON.stringify(value ?? []);
}

async function runResearch(projectId, question, urls = []) {
  const client = await pool.connect();

  try {
    // STEP 1: Update project status.
    await client.query(
      'UPDATE research_projects SET status=$1, updated_at=now() WHERE id=$2',
      ['researching', projectId]
    );

    const sources = [];

    // STEP 2: Fetch and parse permitted sources.
    for (const url of sourceUrls(question, urls)) {
      try {
        if (!(await allowedByRobots(url))) {
          throw new Error('Blocked by robots.txt');
        }

        const html = await fetchPage(url);
        const parsed = parseHtml(html, url);

        const id = crypto.randomUUID();

        await client.query(
          `INSERT INTO sources
           (id, project_id, url, title, fetched_at, content_hash)
           VALUES ($1, $2, $3, $4, now(), $5)`,
          [
            id,
            projectId,
            url,
            parsed.title,
            crypto.createHash('sha256')
              .update(parsed.content)
              .digest('hex')
          ]
        );

        sources.push({
          id,
          url,
          ...parsed
        });

      } catch (error) {
        console.warn(
          `Source skipped (${url}): ${error.message}`
        );
      }
    }

    // STEP 3: Update status to analyzing.
    await client.query(
      'UPDATE research_projects SET status=$1, updated_at=now() WHERE id=$2',
      ['analyzing', projectId]
    );

    // STEP 4: Analyze collected information.
    const report = await analyze(question, sources);

    // Validate analyzer output.
    if (!report || typeof report.summary !== 'string') {
      throw new Error('Analyzer returned an invalid report');
    }

    const reportId = crypto.randomUUID();

    // STEP 5: Save report using PostgreSQL JSONB.
    // IMPORTANT: JSON.stringify converts JavaScript arrays into valid JSON.
    await client.query(
      `INSERT INTO research_reports (
        id,
        project_id,
        summary,
        key_findings,
        important_facts,
        comparison_points,
        pros,
        cons,
        limitations
      )
      VALUES (
        $1, $2, $3,
        $4::jsonb,
        $5::jsonb,
        $6::jsonb,
        $7::jsonb,
        $8::jsonb,
        $9::jsonb
      )`,
      [
        reportId,
        projectId,
        report.summary,
        toJson(report.key_findings),
        toJson(report.important_facts),
        toJson(report.comparison_points),
        toJson(report.pros),
        toJson(report.cons),
        toJson(report.limitations)
      ]
    );

    // STEP 6: Save citations.
    for (const source of sources) {
      await client.query(
        `INSERT INTO research_citations
         (id, report_id, source_id, claim)
         VALUES ($1, $2, $3, $4)`,
        [
          crypto.randomUUID(),
          reportId,
          source.id,
          'Source reviewed for this report'
        ]
      );
    }

    // STEP 7: Mark project as completed.
    await client.query(
      'UPDATE research_projects SET status=$1, updated_at=now() WHERE id=$2',
      ['completed', projectId]
    );

    console.log(
      `Research completed successfully: ${projectId}`
    );

  } catch (error) {
    console.error(
      `Research failed (${projectId}):`,
      error
    );

    // Mark project as failed and preserve the error.
    try {
      await client.query(
        `UPDATE research_projects
         SET status=$1, error_message=$2, updated_at=now()
         WHERE id=$3`,
        ['failed', error.message, projectId]
      );
    } catch (dbError) {
      console.error(
        'Failed to update research project status:',
        dbError
      );
    }

  } finally {
    client.release();
  }
}

module.exports = {
  runResearch
};
