const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const { httpLogger } = require('./config/logger');
const { notFound, globalErrorHandler } = require('./common/middleware/error.middleware');
const { globalLimiter } = require('./common/middleware/rate-limit.middleware');
const v1Routes = require('./routes/v1.routes');

const app = express();

const corsOrigin = env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map(s => s.trim());

app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use('/api/v1', v1Routes);

app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
