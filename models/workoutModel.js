const mongoose = require('mongoose');

// Set Schema
const setSchema = new mongoose.Schema({
  reps: Number,
  weight: Number,
});

// Exercise Reference Schema
const exerciseRefSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  sets: [setSchema],
});

// Workout Schema
const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A workout must belong to an user'],
  },
  date: { type: Date, default: Date.now },
  name: String,
  exercises: [exerciseRefSchema],
});

workoutSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'exercises',
    populate: {
      path: 'exercise',
    },
  });
  next();
});

const workout = mongoose.model('Workout', workoutSchema);

module.exports = workout;
