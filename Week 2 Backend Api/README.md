# Todo API

This project is a production-quality in-memory Todo CRUD API built with Node.js, Express.js, JavaScript (ES6), and Swagger UI.

The application stores data only in memory. When the server stops, all data is lost and the sample tasks are restored only when the server starts again or when you call `POST /reset`.

## Installation

```bash
npm install
```

## Running the API

```bash
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

The server runs on port `3000`.

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

## Project Structure

```text
Week 1 Backend Api/
├── app.js
├── index.js
├── package.json
├── routes/
│   └── tasks.js
├── controllers/
│   └── taskController.js
├── swagger/
│   └── swagger.json
├── README.md
└── .gitignore
```

## Validation Rules

The API validates request input before changing any data:

- `POST /tasks` requires a non-empty `title`.
- `PUT /tasks/:id` allows updating `title` and `done`.
- `title` must be a non-empty string when provided.
- `done` must be a boolean when provided.
- `GET /tasks?done=true` and `GET /tasks?done=false` only accept those two values.
- `GET /tasks?search=text` rejects empty search text.
- Invalid task IDs return a JSON error response.

## Example curl Commands

### Get API information

```bash
curl http://localhost:3000/
```

### Health check

```bash
curl http://localhost:3000/health
```

### Get all tasks

```bash
curl http://localhost:3000/tasks
```

### Filter completed tasks

```bash
curl "http://localhost:3000/tasks?done=true"
```

### Search tasks

```bash
curl "http://localhost:3000/tasks?search=learn"
```

### Create a task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Buy groceries\"}"
```

### Update a task

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"done\":true}"
```

### Delete a task

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

### Get statistics

```bash
curl http://localhost:3000/stats
```

### Reset tasks

```bash
curl -X POST http://localhost:3000/reset
```

## Postman Testing

1. Start the server with `npm start`.
2. Open Postman and create a request for the endpoint you want to test.
3. Set the HTTP method correctly, for example `GET`, `POST`, `PUT`, or `DELETE`.
4. For `POST /tasks` and `PUT /tasks/:id`, set the body type to `raw` and choose `JSON`.
5. Add the `Content-Type: application/json` header for requests with JSON bodies.
6. Send the request and check the JSON response and status code.

## Swagger UI

Open the API documentation in your browser:

```text
http://localhost:3000/docs
```

### Swagger Screenshot Placeholder

Add a screenshot here after running the API and opening Swagger UI.

## Future Improvements

- Add persistent storage with a database.
- Add automated tests with a test runner such as Jest or Mocha.
- Add authentication and authorization.
- Add pagination for large task lists.
- Add request logging and better observability.

## Git Commit Plan

Commit 1
Initial Express server

Commit 2
Root and health endpoints

Commit 3
GET endpoints

Commit 4
POST endpoint with validation

Commit 5
PUT and DELETE endpoints

Commit 6
Swagger documentation

Commit 7
README and cleanup

## Notes

The assignment text contains a conflict for `GET /`: one stage asks for a hello message, while a later stage asks for API metadata. This project keeps `GET /` for API metadata and adds `GET /hello` for the hello message so both requirements are represented cleanly.