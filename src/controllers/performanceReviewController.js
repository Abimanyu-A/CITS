import { PerformanceReview } from "../models/performanceReviews.js";
import { PerformanceReviewArchive } from "../models/performanceReviewArchive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Employee } from "../models/employeeSchema.js";

export const createPerformanceReview = asyncHandler(async (req, res) => {
  const { employeeId, reviewDate, reviewPeriod, overallScore, ratings, feedback, reviewerId } = req.body;
  const existingReview = await PerformanceReview.findOne({ 
    employeeId: employeeId,
    reviewPeriod: reviewPeriod
  });
  
  if (existingReview) {
    return res.status(409).json({ message: "Review for this employee in the specified period already exists" });
  }

  const createReview = new PerformanceReview({
    employeeId,
    reviewDate,
    reviewPeriod,
    overallScore,
    ratings,
    feedback,
    reviewerId,
    version: 1
  });

  await createReview.save();

  res.status(201).json({ message: "Performance review created successfully", review: createReview });
});

export const getPerformanceReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await PerformanceReview.findById(reviewId)
    .populate('employeeId', 'firstName lastName position')
    .populate('reviewerId', 'firstName lastName');

  console.log(review)

  if (!review) {
    return res.status(404).json({ message: "Performance review not found" });
  }

  res.status(200).json(review);
});

export const getAllPerformanceReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, employeeId, reviewPeriod } = req.query;
  
  const query = {};
  if (employeeId) query.employeeId = employeeId;
  if (reviewPeriod) query.reviewPeriod = reviewPeriod;

  const reviews = await PerformanceReview.find(query)
    .populate('employeeId', 'firstName lastName position')
    .populate('reviewerId', 'firstName lastName')
    .sort({ reviewDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await PerformanceReview.countDocuments(query);

  res.status(200).json({
    reviews,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

export const updatePerformanceReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const updatedData = req.body;

  // Prevent updates to restricted fields
  const restrictedFields = ["_id", "employeeId", "reviewerId", "reviewPeriod"];
  restrictedFields.forEach((field) => delete updatedData[field]);

  const existingReview = await PerformanceReview.findById(reviewId);
  if (!existingReview) {
    return res.status(404).json({ message: "Performance review not found" });
  }

  // Archive the old review before updating
  await PerformanceReviewArchive.create({
    originalReviewId: existingReview._id,
    employeeId: existingReview.employeeId,
    reviewDate: existingReview.reviewDate,
    reviewPeriod: existingReview.reviewPeriod,
    overallScore: existingReview.overallScore,
    ratings: existingReview.ratings,
    feedback: existingReview.feedback,
    reviewerId: existingReview.reviewerId,
    version: existingReview.version,
    archivedAt: new Date(),
  });

  const updatedReview = await PerformanceReview.findByIdAndUpdate(
    reviewId,
    { ...updatedData, $inc: { version: 1 } },
    { new: true, runValidators: true }
  ).populate('employeeId', 'firstName lastName position')
   .populate('reviewerId', 'firstName lastName');

  res.status(200).json({
    message: "Performance review updated successfully",
    review: updatedReview,
  });
});

export const deletePerformanceReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await PerformanceReview.findByIdAndUpdate(
    reviewId,
    { isDeleted: true },
    { new: true }
  );

  if (!review) {
    return res.status(404).json({ message: "Performance review not found" });
  }

  res.status(200).json({ message: "Performance review marked as deleted" });
});

export const getEmployeeReviews = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  console.log(employeeId)
  
  const reviews = await PerformanceReview.find({ employeeId, isDeleted: false })
    .populate('reviewerId', 'firstName lastName')
    .sort({ reviewDate: -1 });
    console.log(reviews);


  res.status(200).json(reviews);
});

export const getReviewHistory = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  
  const archives = await PerformanceReviewArchive.find({ originalReviewId: reviewId })
    .sort({ version: -1 });

  res.status(200).json(archives);
});