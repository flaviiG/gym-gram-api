const Workout = require('../models/workoutModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.createWorkout = catchAsync(async (req, res, next) => {
  const newWorkout = await Workout.create({ ...req.body.workout, userId: req.user.id });

  res.status(201).json({
    status: 'success',
    data: {
      workout: newWorkout,
    },
  });
});

exports.getAllWorkouts = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Workout.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const workouts = await features.query;

  res.status(200).json({
    status: 'success',
    data: {
      workouts,
    },
  });
});

exports.getWorkoutsByUserId = catchAsync(async (req, res, next) => {
  const workouts = await Workout.find({ userId: req.params.userId });

  res.status(200).json({
    status: 'success',
    data: {
      workouts,
    },
  });
});

exports.myWorkouts = catchAsync(async (req, res, next) => {
  //
  const workouts = await Workout.find({ userId: req.user.id });

  res.status(200).json({
    status: 'success',
    data: {
      workouts,
    },
  });
});

exports.mostSavedWorkouts = catchAsync(async (req, res, next) => {
  const workouts = await Workout.aggregate([
    {
      $lookup: {
        from: 'users', // Name of the users collection
        localField: '_id',
        foreignField: 'savedWorkouts',
        as: 'usersWithWorkout',
      },
    },
    {
      $addFields: {
        numSaves: { $size: '$usersWithWorkout' },
      },
    },
    { $sort: { numSaves: -1 } },
    { $limit: 5 },

    {
      $project: {
        usersWithWorkout: 0, // Exclude the usersWithWorkout field
      },
    },
  ]);

  const workoutsWithExercises = await Workout.populate(workouts, {
    path: 'exercises',
    populate: {
      path: 'exercise',
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      workouts: workoutsWithExercises,
    },
  });
});
