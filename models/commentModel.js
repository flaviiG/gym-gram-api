const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An user is required to comment'],
  },
  commentText: {
    type: String,
    required: [true, 'A comment must contain some text'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'username photo',
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
