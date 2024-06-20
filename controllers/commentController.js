const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createComment = catchAsync(async (req, res, next) => {
  const { postId } = req.body;
  const newComment = await Comment.create({ ...req.body.comment, user: req.user.id });

  const post = await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: newComment._id } },
    { new: true },
  );

  if (!post) {
    await Comment.findByIdAndDelete(newComment._id);
    return next(new AppError('No post with this id', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      comment: newComment,
    },
  });
});

exports.getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({});

  res.status(200).json({
    status: 'success',
    data: {
      comments,
    },
  });
});
