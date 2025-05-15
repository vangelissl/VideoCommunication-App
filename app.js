import 'dotenv/config';
import createError from 'http-errors';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import db from './models/db.js'

import { authenticateToken, requireRole } from './middleware/jwtAuth.js';


const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function connectDb() {
  try {
    await db.initialize();
    console.log('Database initialized, server starting...');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

await connectDb();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Public routes (no authentication required)
app.use('/', indexRouter);
app.use('/auth', authRouter);

// Authentication middleware (used for specific 'protected' routes)
usersRouter.use(authenticateToken);
usersRouter.use(requireRole);

app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
