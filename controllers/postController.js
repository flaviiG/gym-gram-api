const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Post = require('../models/postModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `public/img/posts/${req.user.id}`;
    // Check if the directory exists
    if (!fs.existsSync(dir)) {
      // Create the directory if it doesn't exist
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1];
    cb(null, `temp-${Date.now()}-user-${req.user.id}.${extension}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2000000 /* bytes */ },
});

exports.uploadPostPhoto = upload.single('photo');

exports.getPosts = catchAsync(async (req, res, next) => {
  console.log(req.query.userId);
  const posts = await Post.find({ user: req.query.userId }).select('+numComments +numLikes');

  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

exports.newPost = catchAsync(async (req, res, next) => {
  //
  if (!req.file) {
    return next(new AppError('A post must contain a photo', 400));
  }

  const newPost = await Post.create({ ...req.body, user: req.user.id });

  const extension = req.file.mimetype.split('/')[1];
  const newFilename = `${newPost._id}.${extension}`;
  const oldPath = path.join(`public/img/posts/${req.user.id}`, req.file.filename);
  const newPath = path.join(`public/img/posts/${req.user.id}`, newFilename);

  // Rename the file to use the post ID
  fs.renameSync(oldPath, newPath);

  // Update the post with the new filename
  newPost.photo = newFilename;
  await newPost.save();

  const newPostToSend = await Post.findById(newPost._id);

  res.status(201).json({
    status: 'success',
    data: {
      post: newPostToSend,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  await Post.findByIdAndDelete(req.params.postId);

  res.status(200).json({
    status: 'success  ',
  });
});

exports.addPostPhoto = catchAsync(async (req, res, next) => {
  //
  const post = await Post.findById(req.params.postId);
  if (post.photo != null) {
    return next(new AppError('The post already has a photo', 400));
  }
  post.photo = req.file.filename;
  await post.save();

  res.status(200).json({
    status: 'success',
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  // The user who liked the post:
  const userId = req.user.id;

  const post = await Post.findById(postId);

  if (post.likedBy.find((id) => id === userId))
    return next(new AppError('You already liked this post', 400));

  post.numLikes += 1;
  post.likedBy.push(userId);
  await post.save();

  res.status(200).json({
    status: 'success',
    data: {
      numLikes: post.numLikes,
      likebBy: post.likedBy,
    },
  });
});

exports.unlikePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  // The user who liked the post:
  const userId = req.user.id;

  const post = await Post.findById(postId);

  if (!post.likedBy.find((id) => id === userId))
    return next(new AppError("You didn't like this post", 400));

  post.numLikes -= 1;
  //delete userId from likedBy array
  post.likedBy.pull(userId);
  await post.save();

  res.status(200).json({
    status: 'success',
    data: {
      numLikes: post.numLikes,
      likebBy: post.likedBy,
    },
  });
});

exports.getFeed = catchAsync(async (req, res, next) => {
  //
  //
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 4);

  const features = new APIFeatures(
    Post.find({ user: { $in: req.user.following }, createdAt: { $gte: twoDaysAgo } }),
    req.query,
  )
    .sort()
    .limitFields();
  const posts = await features.query;

  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

exports.like = catchAsync(async (req, res, next) => {
  await Post.findByIdAndUpdate(req.params.postId, { $push: { likedBy: req.user.id } });

  res.status(200).json({
    status: 'success',
  });
});

exports.unlike = catchAsync(async (req, res, next) => {
  await Post.findByIdAndUpdate(req.params.postId, { $pull: { likedBy: req.user.id } });

  res.status(200).json({
    status: 'success',
  });
});

exports.getPostComments = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId).populate('comments');

  const { comments } = post;

  res.status(200).json({
    status: 'success',
    data: {
      comments,
    },
  });
});
