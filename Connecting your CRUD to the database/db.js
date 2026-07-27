const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT 0 CHECK (done IN (0, 1))
  )
`);

const seedTasks = [
  { title: 'Learn Express', done: 0 },
  { title: 'Learn Swagger', done: 1 },
  { title: 'Finish Assignment', done: 0 }
];

const countTasksStatement = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const selectAllStatement = db.prepare('SELECT id, title, done FROM tasks ORDER BY id ASC');
const selectByIdStatement = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?');
const insertStatement = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
const updateStatement = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
const deleteStatement = db.prepare('DELETE FROM tasks WHERE id = ?');
const clearStatement = db.prepare('DELETE FROM tasks');

function seedIfEmpty() {
  const { count } = countTasksStatement.get();

  if (count !== 0) {
    return;
  }

  const seedTransaction = db.transaction((tasks) => {
    for (const task of tasks) {
      insertStatement.run(task.title, task.done);
    }
  });

  seedTransaction(seedTasks);
}

seedIfEmpty();

function toTask(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done)
  };
}

function buildTaskQuery(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.done !== undefined) {
    clauses.push('done = ?');
    params.push(filters.done ? 1 : 0);
  }

  if (filters.search !== undefined) {
    clauses.push('LOWER(title) LIKE ?');
    params.push(`%${filters.search.toLowerCase()}%`);
  }

  const whereClause = clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '';
  const statement = db.prepare(`SELECT id, title, done FROM tasks${whereClause} ORDER BY id ASC`);

  return statement.all(...params).map(toTask);
}

function getTaskById(id) {
  return toTask(selectByIdStatement.get(id));
}

function createTask(title, done = false) {
  const result = insertStatement.run(title, done ? 1 : 0);
  return getTaskById(Number(result.lastInsertRowid));
}

function updateTask(id, title, done) {
  const result = updateStatement.run(title, done ? 1 : 0, id);

  if (result.changes === 0) {
    return null;
  }

  return getTaskById(id);
}

function deleteTask(id) {
  return deleteStatement.run(id);
}

function getStats() {
  const totalStatement = db.prepare('SELECT COUNT(*) AS total FROM tasks');
  const completedStatement = db.prepare('SELECT COUNT(*) AS completed FROM tasks WHERE done = 1');

  const total = totalStatement.get().total;
  const completed = completedStatement.get().completed;

  return {
    total,
    completed,
    pending: total - completed
  };
}

function resetTasks() {
  const resetTransaction = db.transaction(() => {
    clearStatement.run();

    for (const task of seedTasks) {
      insertStatement.run(task.title, task.done);
    }
  });

  resetTransaction();

  return selectAllStatement.all().map(toTask);
}

module.exports = {
  buildTaskQuery,
  createTask,
  deleteTask,
  getStats,
  getTaskById,
  resetTasks,
  updateTask,
  toTask
};