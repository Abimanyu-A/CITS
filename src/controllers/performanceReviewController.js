import { PerformanceReview } from "../models/performanceReviews.js";
import { PerformanceReviewArchive } from "../models/performanceReviewArchive.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const createPerformanceReview = asyncHandler(async(req, res) => {
  const { employeeID, reviewDate, reviewPeriod, overallScore, performanceRating, feedback } = req.body;
  
})

export const updatePerformanceReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const updatedData = req.body;

    // Prevent updates to restricted fields
    const restrictedFields = ["_id", "version", "employeeId", "reviewerId"];
    restrictedFields.forEach(field => delete updatedData[field]);

    // Fetch existing review
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
      performanceRating: existingReview.performanceRating,
      feedback: existingReview.feedback,
      reviewerId: existingReview.reviewerId,
      version: existingReview.version,
    });

    // Update the review with a new version
    const updatedReview = await PerformanceReview.findByIdAndUpdate(
      reviewId,
      { ...updatedData, $inc: { version: 1 } },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Performance review updated successfully", review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: "Error updating performance review", error: error.message });
  }
};
