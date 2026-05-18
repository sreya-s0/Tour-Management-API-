const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = ` ${err.path} ${err.value} is invalid`;
  return new AppError(message, 400);
};

const handleJWTExpiryError = () =>
  new AppError('token expired please login again', 401);
const handleJWTError = () =>
  new AppError('Invalid token please login again', 401);

const handleDuplicateErrorDB = (err) => {
  const regex = /\{([^}]+)\}/;
  const value = err.errorResponse.errmsg.match(regex);
  //   console.log('value: ', value[0]);
  const message = `Duplicate field ${value[0]} Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  console.error(errors);
  const message = `Invalid input data ${errors}`;
  return new AppError(message, 400);
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message,
  });
};

const sendProError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR');
    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiryError();

    sendProError(error, res);
  }
};
