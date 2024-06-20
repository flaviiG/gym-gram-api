const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

const deleteOldUserPhotos = (userId, currentPhoto) => {
  const directory = path.join(__dirname, '../public/img/users');

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      if (file.startsWith(`user-${userId}`) && file !== currentPhoto) {
        fs.unlink(path.join(directory, file), (errr) => {
          if (errr) throw errr;
        });
      }
    });
  });
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
  },
});

const multerFilter = (req, file, cb) => {
  console.log(file);
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

exports.uploadUserPhoto = upload.single('photo');

function filterObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}

exports.getUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user posts password data
  if (req.body.password) return next(new AppError("You cant't modify your password from here"));

  // 2) filtered out fields
  const filteredBody = filterObj(req.body, 'username', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  deleteOldUserPhotos(req.user.id, req.file.filename);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.searchUser = catchAsync(async (req, res, next) => {
  if (!req.params.searchValue) {
    return next(new AppError('No search value provided', 400));
  }
  const users = await User.find({
    username: { $regex: req.params.searchValue, $options: 'i' },
  })
    .limit(5)
    .select('_id username photo');

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.followUser = catchAsync(async (req, res, next) => {
  if (!req.params.userId) {
    return next(new AppError('No user to follow provided', 400));
  }

  const user = await User.findById(req.params.userId);

  if (user.followedBy.find((id) => id === req.user.id))
    return next(new AppError('You already follow this user', 400));

  await User.findByIdAndUpdate(req.user.id, {
    $push: { following: req.params.userId },
  });

  user.followedBy.push(req.user.id);
  await user.save();

  res.status(200).json({
    status: 'success',
  });
});

exports.unfollowUser = catchAsync(async (req, res, next) => {
  if (!req.params.userId) {
    return next(new AppError('No user to follow provided', 400));
  }

  const user = await User.findById(req.params.userId);

  if (!user.followedBy.find((id) => id === req.user.id))
    return next(new AppError('You are not following this user', 400));

  await User.findByIdAndUpdate(req.user.id, {
    $pull: { following: req.params.userId },
  });
  user.followedBy.pull(req.user.id);
  await user.save();

  res.status(200).json({
    status: 'success',
  });
});

exports.getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select(
    'username photo followedBy following numFollowers numFollowing savedWorkouts',
  );

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.saveWorkout = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { $push: { savedWorkouts: req.body.workout } });

  res.status(200).json({
    status: 'success',
  });
});

exports.removeSavedWorkout = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { $pull: { savedWorkouts: req.body.workout } });

  res.status(200).json({
    status: 'success',
  });
});

exports.savedWorkouts = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('savedWorkouts');

  res.status(200).json({
    status: 'success',
    data: {
      savedWorkouts: user.savedWorkouts,
    },
  });
});

exports.mostPopularUsers = catchAsync(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $addFields: {
        numFollowers: { $size: '$followedBy' },
      },
    },
    {
      $sort: { numFollowers: -1 },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        username: 1,
        photo: 1,
        followedBy: 1,
        following: 1,
        numFollowers: 1,
        numFollowing: { $size: '$following' },
        savedWorkouts: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});
