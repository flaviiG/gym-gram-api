const express = require('express');
const postReportController = require('../controllers/postReportController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    postReportController.getAllPostReports,
  )
  .post(authController.protect, postReportController.createPostReport);

router
  .route('/:reportId')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    postReportController.deleteReport,
  );

module.exports = router;
