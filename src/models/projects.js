import { Schema, model } from "mongoose";

const projectSchema = new Schema(
    {
        projectName: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
            minlength: [3, "Project name must be at least 3 characters"],
            maxlength: [100, "Project name must be at most 100 characters"]
        },
        projectCode: {
            type: String,
            required: [true, "Project code is required"],
            unique: true, // Ensures no duplicate project codes
            uppercase: true, // Standardizes format
            trim: true
        },
        projectType: {
            type: String,
            enum: ["Internal", "Client", "Research", "Other"],
            required: true
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            required: true,
            default: "Medium"
        },
        startDate: {
            type: Date,
            required: true
        },
        expectedEndDate: {
            type: Date,
            required: true
        },
        actualEndDate: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"],
            required: true,
            default: "Not Started"
        },
        budget: {
            type: Number,
            required: true,
            min: [0, "Budget cannot be negative"]
        },
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            default: null
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },
        projectManagerId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        }
    },
    { 
        timestamps: true 
    }
);

// Ensure `expectedEndDate` is after `startDate`
projectSchema.pre("save", function (next) {
    if (this.expectedEndDate < this.startDate) {
        return next(new Error("Expected end date cannot be before start date"));
    }
    next();
});

// Ensure `actualEndDate` is after `startDate`
projectSchema.pre("save", function (next) {
    if (this.actualEndDate && this.actualEndDate < this.startDate) {
        return next(new Error("Actual end date cannot be before start date"));
    }
    next();
});

export const Project = model("Project", projectSchema);
