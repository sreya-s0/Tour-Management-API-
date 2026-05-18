const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const Router = express.Router();

Router.route('/signup').post(authController.signup);
Router.route('/login').post(authController.login);

Router.route('/forgotPassword').post(authController.forgotPassword);
Router.route('/resetPassword/:token').patch(authController.resetPassword);
Router.route('/updatePassword').patch(
  authController.protect,
  authController.updatePassword
);

Router.route('/deleteMe').delete(
  authController.protect,
  userController.deleteMe
);

Router.route('/updateMe').patch(
  authController.protect,
  userController.updateMe
);

Router.route('/').get(userController.getAllUsers);

Router.route('/:id').get(userController.getUser);

module.exports = Router;
