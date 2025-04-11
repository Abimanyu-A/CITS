import { Schema, model } from "mongoose";

const performanceReviewArchiveSchema = new Schema(
  {
    originalReviewId: {
      type: Schema.Types.ObjectId,
      ref: "PerformanceReview",
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reviewDate: Date,
    reviewPeriod: String,
    overallScore: Number,
    ratings: {
      productivity: Number,
      communication: Number,
      teamwork: Number,
      leadership: Number,
      punctuality: Number,
    },
    feedback: String,
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    archivedAt: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      required: true,
    }, 
  },
  { 
    timestamps: true,
    versionKey: false,
  }
);

performanceReviewArchiveSchema.index({ employeeId: 1, archivedAt: -1 });

export const PerformanceReviewArchive = model("PerformanceReviewArchive", performanceReviewArchiveSchema);
