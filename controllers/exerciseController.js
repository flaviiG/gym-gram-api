const catchAsync = require('../utils/catchAsync');
const Exercise = require('../models/exerciseModel');
const APIFeatures = require('../utils/apiFeatures');

exports.createExercise = catchAsync(async (req, res, next) => {
  const newExercise = await Exercise.create(req.body.exercise);

  res.status(201).json({
    status: 'success',
    data: {
      exercise: newExercise,
    },
  });
});

exports.getAllExercises = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Exercise.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const exercises = await features.query;

  res.status(201).json({
    status: 'success',
    data: {
      exercises,
    },
  });
});
