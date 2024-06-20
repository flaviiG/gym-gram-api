const express = require('express');
const workoutController = require('../controllers/workoutController');
const authController = require('../controllers/authController');

const router = new express.Router();

router.route('/myWorkouts').get(authController.protect, workoutController.myWorkouts);

router
  .route('/mostSaved')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    workoutController.mostSavedWorkouts,
  );

router
  .route('/')
  .get(workoutController.getAllWorkouts)
  .post(authController.protect, workoutController.createWorkout);

module.exports = router;
