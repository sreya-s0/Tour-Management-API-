const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const NodeRateLimiter = require('node-rate-limiter');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

app.use(helmet());

console.log(`env : ${process.env.NODE_ENV}`);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10kb' }));
app.use(express.static(`${__dirname}/public`));

// //Limiting Requests
// const limiter = new NodeRateLimiter({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from the same IP , try again after an hour',
// });

// app.use('/api', limiter);

//NoSQL Injection :
app.use(mongoSanitize());

//XSS :
app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

//Route handlers

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`cant find any ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
