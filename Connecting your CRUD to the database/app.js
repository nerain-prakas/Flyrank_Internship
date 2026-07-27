const express = require('express');
const swaggerUi = require('swagger-ui-express');
const tasksRouter = require('./routes/tasks');
const swaggerDocument = require('./swagger/swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Todo API',
    version: '1.0.0'
  });
});

app.get('/hello', (req, res) => {
  res.status(200).json({
    message: 'Hello from Todo API'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', tasksRouter);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Todo API server running on port ${PORT}`);
});

module.exports = app;