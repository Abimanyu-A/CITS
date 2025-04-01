import { Schema, model } from "mongoose";

const clientSchema = new Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    industryType: {
      type: String,
      required: true,
      enum: ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Education", "Other"],
      default: "Other",
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    contactEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    contactPhone: {
      type: String,
      required: true,
      match: [/^\+?\d{10,15}$/, "Invalid phone number format"], 
    },
    clientStatus: {
      type: String,
      required: true,
      enum: ["Active", "Inactive", "Pending"],
      default: "Active",
    },
  },
  { timestamps: true } 
);

clientSchema.index({ clientName: 1, industryType: 1 });

export const Client = model("Client", clientSchema);
