const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (option) => {
  //1)Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2)provide mail options
  const mailOptions = {
    from: 'test<test@example.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  //3)Send email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
