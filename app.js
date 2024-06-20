const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const postReportRouter = require('./routes/postReportsRouter');
const exerciseRouter = require('./routes/exerciseRouter');
const workoutRouter = require('./routes/workoutRouter');
const commentRouter = require('./routes/commentRouter');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// security
app.use(helmet());

// dev logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// requests rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests for this ip, please try again in an hour',
});

// body parser
app.use(express.json({ limit: '20kb' }));

// data sanitization against nosql injection
app.use(mongoSanitize());

// data sanitization against xss
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.static('public'));

app.use('/api', limiter);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/postReports', postReportRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/exercises', exerciseRouter);
app.use('/api/v1/workouts', workoutRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
