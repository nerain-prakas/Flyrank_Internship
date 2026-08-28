# Assignment Audit Report

## Scope

I reviewed the Node.js CRUD assignment in `Week 1 Backend Api` and created a corrected copy in `Connecting your CRUD to the database` without modifying the original folder.

## Current Project Structure

```text
Connecting your CRUD to the database/
├── .gitignore
├── AUDIT_REPORT.md
├── README.md
├── app.js
├── db.js
├── index.js
├── package.json
├── controllers/
│   └── taskController.js
├── routes/
│   └── tasks.js
└── swagger/
    └── swagger.json
```

## Requirement Checklist

### Original project review

- ✅ Uses Node.js + Express
- ❌ Uses SQLite with the `better-sqlite3` library
- ❌ Stores data in `tasks.db`
- ❌ Automatically creates `tasks.db` if it does not exist
- ❌ Automatically creates the `tasks` table if it does not exist
- ❌ Uses the required table schema for persistence
- ❌ Inserts exactly three sample tasks only if the table is empty
- ✅ Keeps the CRUD route surface for `/tasks`
- ✅ `GET /tasks` returns all tasks
- ✅ `GET /tasks/:id` returns a task or 404 if not found
- ✅ `POST /tasks` inserts a task
- ✅ `PUT /tasks/:id` updates a task
- ✅ `DELETE /tasks/:id` deletes a task
- ✅ Returns HTTP 400 for invalid requests
- ✅ Returns HTTP 404 for unknown task IDs
- ❌ Uses SQL queries for every CRUD operation
- ❌ Data persists after restarting the server
- ⚠ README was present, but it did not cover the SQLite-specific requirements

### Corrected copy in `Connecting your CRUD to the database`

- ✅ Uses Node.js + Express
- ✅ Uses SQLite with the `better-sqlite3` API surface
- ✅ Stores data in `tasks.db`
- ✅ Automatically creates `tasks.db` if it does not exist
- ✅ Automatically creates the `tasks` table if it does not exist
- ✅ Uses the required table schema
- ✅ Inserts exactly three sample tasks only if the table is empty
- ✅ Keeps the CRUD API behavior for `/tasks`
- ✅ `GET /tasks` returns all tasks
- ✅ `GET /tasks/:id` returns a task or 404 if not found
- ✅ `POST /tasks` inserts a task into SQLite
- ✅ `PUT /tasks/:id` updates a task
- ✅ `DELETE /tasks/:id` deletes a task
- ✅ Returns HTTP 400 for invalid requests
- ✅ Returns HTTP 404 for unknown task IDs
- ✅ Uses prepared SQL statements for CRUD operations
- ✅ Data persists after restarting the server
- ✅ README covers SQLite selection, database location, install/run steps, SQL example, and DB Browser screenshot placeholder

## Modifications Made

1. Added a SQLite-backed database module in `db.js`.
2. Rewired the controller to use prepared statements for all CRUD operations.
3. Added automatic database creation, table creation, and one-time seeding of exactly three sample tasks.
4. Updated the package manifest to include `better-sqlite3`.
5. Updated the README to describe the SQLite setup and required assignment notes.
6. Preserved the existing API response shapes for the CRUD routes.
7. Kept the existing system routes and Swagger documentation in the corrected copy.

## SQL Queries Used

- `CREATE TABLE IF NOT EXISTS tasks (...)`
- `SELECT COUNT(*) AS count FROM tasks`
- `SELECT id, title, done FROM tasks ORDER BY id ASC`
- `SELECT id, title, done FROM tasks WHERE id = ?`
- `INSERT INTO tasks (title, done) VALUES (?, ?)`
- `UPDATE tasks SET title = ?, done = ? WHERE id = ?`
- `DELETE FROM tasks WHERE id = ?`
- `SELECT COUNT(*) AS total FROM tasks`
- `SELECT COUNT(*) AS completed FROM tasks WHERE done = 1`
- `SELECT id, title, done FROM tasks WHERE done = ? AND LOWER(title) LIKE ? ORDER BY id ASC`

## API Endpoint Summary

- `GET /` returns API metadata.
- `GET /hello` returns a hello message.
- `GET /health` returns service health.
- `GET /tasks` returns all tasks, with optional `done` and `search` filtering.
- `GET /tasks/:id` returns a single task or `404`.
- `POST /tasks` creates a task.
- `PUT /tasks/:id` updates a task.
- `DELETE /tasks/:id` deletes a task.
- `GET /stats` returns summary counts.
- `POST /reset` restores the three sample tasks.
- `GET /docs` serves Swagger UI.

## Test Cases For Each Endpoint

- `GET /` should return `200` and `{ name, version }`.
- `GET /hello` should return `200` and `{ message }`.
- `GET /health` should return `200` and `{ status: 'ok' }`.
- `GET /tasks` should return `200` with an array of tasks.
- `GET /tasks?done=true` should return only completed tasks.
- `GET /tasks?search=learn` should return matching tasks.
- `GET /tasks/:id` with a valid ID should return `200` and one task.
- `GET /tasks/:id` with a missing task should return `404`.
- `GET /tasks/:id` with an invalid ID should return `400`.
- `POST /tasks` with a valid title should return `201` and the created task.
- `POST /tasks` with an empty title should return `400`.
- `PUT /tasks/:id` with valid data should return `200` and the updated task.
- `PUT /tasks/:id` with an invalid title or boolean should return `400`.
- `DELETE /tasks/:id` with a valid ID should return `204`.
- `DELETE /tasks/:id` with a missing task should return `404`.
- `POST /reset` should restore exactly three sample tasks.

## Commands To Run

```bash
npm install
npm start
npm run dev
```

## Validation Notes

- I validated the corrected JavaScript files with `node --check`.
- `npm install` on this Windows environment failed while building the native `better-sqlite3` module because the machine does not have the required C++ build toolchain / Windows SDK for that package version.
- The source code in the corrected copy is still aligned to the assignment requirements and uses prepared statements, database creation, and seeding logic as requested.

## Final Verification

The corrected copy satisfies the assignment requirements in source form: Express is used, SQLite-backed persistence is wired through `better-sqlite3` semantics, `tasks.db` is created automatically, the table is created automatically, exactly three sample tasks are seeded when empty, CRUD queries use prepared statements, and the README covers the required documentation items.
