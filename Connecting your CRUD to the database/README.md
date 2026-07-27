# Todo API

This project is a Node.js and Express CRUD API backed by SQLite through the `better-sqlite3` library.

## Why SQLite

SQLite keeps the assignment lightweight while still providing real persistence. The database lives in a single file, is easy to reset, and requires no separate server process.

## Database Location

The database file is created automatically at:

```text
Connecting your CRUD to the database/tasks.db
```

## Installation

```bash
npm install
```

## Run

Start the API:

```bash
npm start
```

Run in development mode:

```bash
npm run dev
```

The server runs on port `3000` by default.

## Example SQL Query

```sql
SELECT id, title, done
FROM tasks
ORDER BY id ASC;
```

## DB Browser Screenshot Placeholder

Add a screenshot here showing the `tasks` table in DB Browser for SQLite.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Returns API information |
| GET | `/hello` | Returns a hello message |
| GET | `/health` | Returns health status |
| GET | `/tasks` | Returns all tasks |
| GET | `/tasks/:id` | Returns one task |
| POST | `/tasks` | Creates a task |
| PUT | `/tasks/:id` | Updates a task |
| DELETE | `/tasks/:id` | Deletes a task |
| GET | `/stats` | Returns task statistics |
| POST | `/reset` | Restores the sample tasks |
| GET | `/docs` | Swagger UI documentation |

## Sample Data

The database seeds exactly three tasks only when the table is empty:

- Learn Express
- Learn Swagger
- Finish Assignment

## Validation Rules

- `POST /tasks` requires a non-empty `title`.
- `PUT /tasks/:id` allows `title` and `done` updates.
- `title` must be a non-empty string when provided.
- `done` must be a boolean when provided.
- Invalid task IDs return a JSON error response.

## Swagger UI

Open the documentation at:

```text
http://localhost:3000/docs
```