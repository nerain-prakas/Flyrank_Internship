require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const authRouter = require('./routes/auth');
const swaggerDocument = require('./swagger/swagger.json');

const requiredEnvironment = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);

if (missingEnvironment.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Auth Protected API',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/public/info', (req, res) => {
  res.status(200).json({
    message: 'Welcome stranger! This info is public.'
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', authRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Auth API server running on port ${port}`);
  });
}

module.exports = app;