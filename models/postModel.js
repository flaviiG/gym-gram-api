const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    photo: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    description: {
      type: String,
      required: [true, 'A post must have a description'],
    },
    likedBy: {
      type: [String],
      default: [],
    },
    comments: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
      default: [],
    },
    workout: {
      type: mongoose.Schema.ObjectId,
      ref: 'Workout',
      required: [true, 'A post must have a workout attached'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

postSchema.virtual('numComments').get(function () {
  return this.comments.length;
});

postSchema.virtual('numLikes').get(function () {
  return this.likedBy.length;
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'username photo',
  }).populate({
    path: 'workout',
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
