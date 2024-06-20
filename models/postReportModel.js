const mongoose = require('mongoose');

const postReportSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A report must belong to a post'],
    ref: 'Post',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A report must be made by an user'],
    ref: 'User',
  },
  reason: {
    type: String,
    required: [true, 'A reason must be provided when reporting a post'],
  },
});

postReportSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'post',
  }).populate({
    path: 'reportedBy',
  });
  next();
});

const PostReport = mongoose.model('PostReport', postReportSchema);

module.exports = PostReport;
