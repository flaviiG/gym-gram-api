const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/getUser').get(authController.protect, userController.getUser);
router.route('/searchUser/:searchValue').get(authController.protect, userController.searchUser);
router.route('/followUser/:userId').post(authController.protect, userController.followUser);
router.route('/unfollowUser/:userId').post(authController.protect, userController.unfollowUser);
router.route('/saveWorkout').post(authController.protect, userController.saveWorkout);
router.route('/removeSavedWorkout').post(authController.protect, userController.removeSavedWorkout);
router.route('/savedWorkouts').get(authController.protect, userController.savedWorkouts);

router
  .route('/mostPopular')
  .get(authController.protect, authController.restrictTo('admin'), userController.mostPopularUsers);

router.route('/:userId').get(authController.protect, userController.getUserProfile);

router
  .route('/updateMe')
  .patch(authController.protect, userController.uploadUserPhoto, userController.updateMe);

module.exports = router;
