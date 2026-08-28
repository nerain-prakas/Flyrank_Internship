# Todo API

This project is a Node.js and Express CRUD API backed by PostgreSQL through the `pg` library, with Swagger UI at `/docs`.

## Database

Run PostgreSQL in Docker with this command:

```bash
docker run --name taskdb -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=tasks -p 5432:5432 -v taskdata:/var/lib/postgresql/data -d postgres
```

The app expects a `DATABASE_URL` environment variable such as:

```text
postgres://postgres:dev@localhost:5432/tasks
```

Copy `.env.example` to `.env` and set the value there.

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

## Environment Example

```bash
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
```

## Example SQL Query

```sql
SELECT id, title, done
FROM tasks
ORDER BY id ASC;
```

## DB Screenshot Placeholder

Add a screenshot here showing the `tasks` table from `psql`, pgAdmin, DBeaver, or another Postgres client.

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