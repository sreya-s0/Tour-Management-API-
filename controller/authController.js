const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const { findOne } = require('../models/tourModel');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

const createSendToken = (statusCode, user, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(201, newUser, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    return next(new AppError('email or password missing', 400));
  }
  console.log('user: ', { email, password });
  const user = await User.findOne({ email }).select('+password');
  // const user = await User.findOne({ email: email }).select('+password');
  console.log('found: ', user);
  const match = await user.correctPassword(password, user.password);
  if (!user || !match) {
    return next(new AppError('Invalid email or password', 401));
  }
  createSendToken(200, user, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1)check if token exists then get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  //2)Verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  // console.log(freshUser);

  if (!freshUser) {
    return next(new AppError('User no longer exists', 401));
  }

  //4)
  console.log(await freshUser.changedPasswordAfter(decoded.iat));
  if (await freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Password has been changed recently please login again', 401)
    );
  }

  //GRANT ACESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You donot have required permissions for this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)Get user from email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    next(new AppError('User with this email does not exist', 401));
  }

  //2)Generate reset Token
  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  //3)Send email to the user's email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
  const message = `if you have forgotten your password please submit a PATCH request to ${resetUrl} if you have not please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token(10 mins only)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next('There was an error sending email. Try again later', 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  //2) check if user token has expired or the user exists
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  //3)change Passwod changedAt

  //4)send jwt token as response and log the user in
  createSendToken(200, null, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get user
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('Invalid UserId'), 401);
  }

  //2)get current passsword
  const { password } = req.body;

  const match = await user.correctPassword(password, user.password);
  if (!match) {
    return next(new AppError('Invalid Password'), 401);
  }

  //3)update Password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  //4)login user and send jwt
  createSendToken(200, null, res);
});
