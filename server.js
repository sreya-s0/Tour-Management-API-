const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tours = require('./models/tourModel');

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION');
  console.log('CLOSING SERVER.............');
  console.log(err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION');
  console.log(err);

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

mongoose.connect(process.env.MONGODB).then(() => {
  console.log('Database succcesfully connected');
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log('Listening on port:', process.env.PORT);
});
