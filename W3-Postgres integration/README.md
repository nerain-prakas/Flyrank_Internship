# Todo API (PostgreSQL + Docker)

## Project Overview

This is a Node.js Express Todo CRUD API using PostgreSQL as the storage engine. The API endpoints and response formats remain unchanged, and Swagger UI is available for documentation.

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop (or Docker Engine + Compose)

## Installation

```bash
npm install
```

## Environment Setup

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

Required environment variables:

```text
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
PORT=3000
```

Keep credentials in `.env` only.

## Local Setup (without Compose)

Start PostgreSQL container:

```bash
docker run --name taskdb -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=tasks -p 5432:5432 -v taskdata:/var/lib/postgresql/data -d postgres
```

Start API:

```bash
npm start
```

## Docker Setup

Build and start full stack:

```bash
docker compose up --build
```

Stop stack:

```bash
docker compose down
```

Inside Docker, API uses:

```text
DATABASE_URL=postgres://postgres:dev@db:5432/tasks
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Returns API information |
| GET | `/hello` | Returns hello message |
| GET | `/health` | Returns health status |
| GET | `/tasks` | List tasks |
| GET | `/tasks/:id` | Get task by id |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/stats` | Task statistics |
| POST | `/reset` | Reset seed tasks |
| GET | `/docs` | Swagger UI |

## Sample CRUD Commands

Create:

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Write docs\"}"
```

Read all:

```bash
curl -i http://localhost:3000/tasks
```

Read by id:

```bash
curl -i http://localhost:3000/tasks/1
```

Update:

```bash
curl -i -X PUT http://localhost:3000/tasks/1 -H "Content-Type: application/json" -d "{\"title\":\"Write docs\",\"done\":true}"
```

Delete:

```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

## PostgreSQL Verification Commands

Check table:

```bash
docker exec -it taskdb psql -U postgres -d tasks -c "\dt"
```

Check rows:

```bash
docker exec -it taskdb psql -U postgres -d tasks -c "SELECT * FROM tasks ORDER BY id;"
```

Check count:

```bash
docker exec -it taskdb psql -U postgres -d tasks -c "SELECT COUNT(*) FROM tasks;"
```

## Swagger

Open:

```text
http://localhost:3000/docs
```