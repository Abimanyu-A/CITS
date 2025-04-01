import { Schema, model } from "mongoose";

const performanceReviewSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true, 
    },
    reviewDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reviewPeriod: {
      type: String,
      required: true,
      enum: ["Quarterly", "Bi-Annual", "Annual"],
    },
    overallScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    performanceRating: {
      type: String,
      required: true,
      enum: ["Excellent", "Good", "Average", "Below Average", "Poor"],
    },
    feedback: {
      type: String,
      required: true,
      maxlength: 1000, 
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1, 
    },
    isDeleted: {
      type: Boolean,
      default: false, 
    },
  },
  { 
    timestamps: true,
    versionKey: false, 
  }
);

performanceReviewSchema.index({ feedback: "text" });

performanceReviewSchema.pre("save", async function (next) {
  if (!this.isNew) {
    const PerformanceReviewArchive = model("PerformanceReviewArchive");
    await PerformanceReviewArchive.create({ 
      originalReviewId: this._id,
      employeeId: this.employeeId,
      reviewDate: this.reviewDate,
      reviewPeriod: this.reviewPeriod,
      overallScore: this.overallScore,
      performanceRating: this.performanceRating,
      feedback: this.feedback,
      reviewerId: this.reviewerId,
      version: this.version,
    });
    this.version += 1; 
  }
  next();
});

export const PerformanceReview = model("PerformanceReview", performanceReviewSchema);
