import mongoose from "mongoose";

const deptVersionSchema = new mongoose.Schema({
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  DeptName: String,
  DeptHeadID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  Budget: Number,
  versionedAt: {
    type: Date,
    default: Date.now,
  },
});

export const DeptVersion = mongoose.model("DeptVersion", deptVersionSchema);
