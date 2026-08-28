const { Pool } = require('pg');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString });

const seedTasks = [
  { title: 'Learn Express', done: false },
  { title: 'Learn Swagger', done: true },
  { title: 'Finish Assignment', done: false }
];

async function initialize() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);

    const { rows } = await client.query('SELECT COUNT(*)::int AS count FROM tasks');

    if (rows[0].count === 0) {
      for (const task of seedTasks) {
        await client.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', [task.title, task.done]);
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const ready = initialize();

function toTask(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    title: row.title,
    done: Boolean(row.done)
  };
}

async function buildTaskQuery(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.done !== undefined) {
    clauses.push(`done = $${params.length + 1}`);
    params.push(Boolean(filters.done));
  }

  if (filters.search !== undefined) {
    clauses.push(`LOWER(title) LIKE $${params.length + 1}`);
    params.push(`%${filters.search.toLowerCase()}%`);
  }

  const whereClause = clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT id, title, done FROM tasks${whereClause} ORDER BY id ASC`, params);

  return rows.map(toTask);
}

async function getTaskById(id) {
  const { rows } = await pool.query('SELECT id, title, done FROM tasks WHERE id = $1', [id]);
  return toTask(rows[0]);
}

async function createTask(title, done = false) {
  const { rows } = await pool.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING id, title, done',
    [title, done]
  );

  return toTask(rows[0]);
}

async function updateTask(id, title, done) {
  const { rows } = await pool.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING id, title, done',
    [title, done, id]
  );

  return toTask(rows[0]);
}

async function deleteTask(id) {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  return result.rowCount;
}

async function getStats() {
  const [totalResult, completedResult] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM tasks'),
    pool.query('SELECT COUNT(*)::int AS completed FROM tasks WHERE done = TRUE')
  ]);

  const total = totalResult.rows[0].total;
  const completed = completedResult.rows[0].completed;

  return {
    total,
    completed,
    pending: total - completed
  };
}

async function resetTasks() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM tasks');

    for (const task of seedTasks) {
      await client.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', [task.title, task.done]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return buildTaskQuery();
}

module.exports = {
  buildTaskQuery,
  createTask,
  deleteTask,
  getStats,
  getTaskById,
  ready,
  resetTasks,
  updateTask,
  toTask
};