const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/likePost/:postId').patch(authController.protect, postController.likePost);
router.route('/unlikePost/:postId').patch(authController.protect, postController.unlikePost);

router.route('/getFeed').get(authController.protect, postController.getFeed);

router.route('/like/:postId').patch(authController.protect, postController.likePost);
router.route('/unlike/:postId').patch(authController.protect, postController.unlikePost);

router.route('/:postId/comments').get(authController.protect, postController.getPostComments);

router
  .route('/')
  .get(authController.protect, postController.getPosts)
  .post(authController.protect, postController.uploadPostPhoto, postController.newPost);

router.route('/:postId').delete(authController.protect, postController.deletePost);

module.exports = router;
