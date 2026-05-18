const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');

const Router = express.Router();

// Router.param('id', tourController.checkId);
Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/top-tours').get(
  tourController.TopTours,
  tourController.getAllTours
);
Router.route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createNewTour);

Router.route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

module.exports = Router;
