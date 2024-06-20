const PostReport = require('../models/postReportModel');
const catchAsync = require('../utils/catchAsync');

exports.createPostReport = catchAsync(async (req, res, next) => {
  const newPostReport = await PostReport.create({
    ...req.body.postReport,
    reportedBy: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      postReport: newPostReport,
    },
  });
});

exports.getAllPostReports = catchAsync(async (req, res, next) => {
  const postReports = await PostReport.find();

  res.status(200).json({
    status: 'success',
    data: {
      postReports,
    },
  });
});

exports.deleteReport = catchAsync(async (req, res, next) => {
  await PostReport.findByIdAndDelete(req.params.reportId);

  res.status(200).json({
    status: 'success',
  });
});
