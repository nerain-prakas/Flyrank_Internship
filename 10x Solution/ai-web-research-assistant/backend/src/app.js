const crypto = require('node:crypto');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const pool = require('./database/pool');
const auth = require('./middleware/auth');
const { createResearchSchema } = require('./validation');
const { runResearch } = require('./research/worker');
const { writeReport } = require('./pdf/report');
const swagger = require('./swagger');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.get('/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', database: 'up' }); }
  catch (error) { res.status(503).json({ status: 'degraded', database: 'down' }); }
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swagger));
app.use('/api', auth);

async function ownedProject(req, id) {
  const result = await pool.query('SELECT * FROM research_projects WHERE id=$1 AND user_id=$2', [id, req.user.id]);
  return result.rows[0];
}

app.post('/api/research', async (req, res, next) => {
  try {
    const input = createResearchSchema.parse(req.body);
    await pool.query('INSERT INTO users(id,email) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email', [req.user.id, req.user.email]);
    const id = crypto.randomUUID();
    await pool.query('INSERT INTO research_projects(id,user_id,question,status) VALUES($1,$2,$3,$4)', [id, req.user.id, input.question, 'queued']);
    setImmediate(() => runResearch(id, input.question, input.urls));
    res.status(202).json({ id, status: 'queued' });
  } catch (error) { next(error); }
});

app.get('/api/research', async (req, res, next) => {
  try { const result = await pool.query('SELECT * FROM research_projects WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]); res.json({ data: result.rows }); }
  catch (error) { next(error); }
});
app.get('/api/research/:id/status', async (req, res, next) => {
  try { const project = await ownedProject(req, req.params.id); if (!project) return res.status(404).json({ error: 'Research project not found' }); res.json({ id: project.id, status: project.status, error: project.error_message }); }
  catch (error) { next(error); }
});
app.get('/api/research/:id/sources', async (req, res, next) => {
  try { const project = await ownedProject(req, req.params.id); if (!project) return res.status(404).json({ error: 'Research project not found' }); const result = await pool.query('SELECT * FROM sources WHERE project_id=$1', [project.id]); res.json({ data: result.rows }); }
  catch (error) { next(error); }
});
app.get('/api/research/:id/report', async (req, res, next) => {
  try { const project = await ownedProject(req, req.params.id); if (!project) return res.status(404).json({ error: 'Research project not found' }); const result = await pool.query('SELECT * FROM research_reports WHERE project_id=$1', [project.id]); if (!result.rows[0]) return res.status(404).json({ error: 'Report is not ready' }); res.json({ project, report: result.rows[0] }); }
  catch (error) { next(error); }
});
app.get('/api/research/:id/report/pdf', async (req, res, next) => {
  try { const project = await ownedProject(req, req.params.id); if (!project) return res.status(404).json({ error: 'Research project not found' }); const report = (await pool.query('SELECT * FROM research_reports WHERE project_id=$1', [project.id])).rows[0]; if (!report) return res.status(404).json({ error: 'Report is not ready' }); const sources = (await pool.query('SELECT * FROM sources WHERE project_id=$1', [project.id])).rows; writeReport(res, project, report, sources); }
  catch (error) { next(error); }
});
app.delete('/api/research/:id', async (req, res, next) => {
  try { const result = await pool.query('DELETE FROM research_projects WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]); if (!result.rowCount) return res.status(404).json({ error: 'Research project not found' }); res.status(204).end(); }
  catch (error) { next(error); }
});

app.use((error, req, res, next) => {
  if (error.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: error.issues });
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
});
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

module.exports = app;
