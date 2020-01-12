import express from 'express';
import '@babel/polyfill';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
const redisStore = require('connect-redis')(session);
import rateLimit from 'express-rate-limit';
import rateLimitRedisStore from 'rate-limit-redis';

import client from './db/redis.db';
import router from './routes';
import dbconnect from './db/connection.db';
import seedData from './seeder/seeder';

const app = express();

app.use(cors());

// enable morgan logs only in development environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// enable use of dotenv config file.
dotenv.config();

const { SECRET_KEY, PORT, MAXIMUM_RATE, CALL_RATE_WINDOW } = process.env;

if (process.env.NODE_ENV !== 'test') {
  app.use(
    rateLimit({
      store: new rateLimitRedisStore({
        client,
      }),
      windowMs: CALL_RATE_WINDOW,
      max: MAXIMUM_RATE,
    }),
  );
}

app.use(
  session({
    name: 'sid',
    secret: SECRET_KEY,
    store: new redisStore({
      client,
      ttl: 86400000,
    }),
    saveUninitialized: false,
    resave: false,
  }),
);

app.use(
  express.urlencoded({
    extended: false,
  }),
);

app.use(express.json());

// API routes
app.use('/api/v1', router);

// Handling unavailable routes
app.all('*', (req, res) =>
  res.status(405).json({
    error: 'Method not allowed',
  }),
);

dbconnect().then(async () => {
  await seedData();
  if (!module.parent) {
    app.listen(PORT, () => {
      console.log(
        `Server running on ${
          process.env.NODE_ENV
        } environment, on port ${PORT || 5000}`,
      );
    });
  }
});

export default app;
