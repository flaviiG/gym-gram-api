const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: {
    type: String,
    enum: [
      'Back',
      'Chest',
      'Biceps',
      'Triceps',
      'Shoulders',
      'Quads',
      'Hamstrings',
      'Calves',
      'Abs',
      'Forearms',
      'Trapezius',
      'Lats',
      'Glutes',
      'Unknown',
    ],
    default: 'Unknown',
  },
  createdBy: {
    type: String,
    default: 'GymGram',
  },
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
