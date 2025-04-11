import { PerformanceReview } from "../models/performanceReviews.js";
import { PerformanceReviewArchive } from "../models/performanceReviewArchive.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const createPerformanceReview = asyncHandler(async(req, res) => {
  const { employeeId, reviewDate, reviewPeriod, overallScore, ratings, feedback } = req.body;

  const existingReview = await PerformanceReview.findOne({ employeeId: employeeId });
  if(existingReview){
    return res.status(409).json({ messsage: "Review of this employee already exists"});
  };

  const createReview = new PerformanceReview({
    employeeId,
    reviewDate,
    reviewPeriod,
    overallScore,
    ratings,
    feedback,
    version: 1
  })

  await createReview.save();

  res.status(201).json({ message: "Performance review created successfully", review: createReview });
})

export const updatePerformanceReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const updatedData = req.body;

  // Prevent updates to restricted fields
  const restrictedFields = ["_id", "employeeId"];
  restrictedFields.forEach((field) => delete updatedData[field]);

  // Find the existing review
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
    version: existingReview.version,
    archivedAt: new Date(), // Track archive time
  });

  // Ensure versioning exists
  if (!existingReview.version) {
    existingReview.version = 1;
  }

  // Update the review and increment the version
  const updatedReview = await PerformanceReview.findByIdAndUpdate(
    reviewId,
    { ...updatedData, $inc: { version: 1 } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Performance review updated successfully",
    review: updatedReview,
  });
});
