import { Schema, model } from "mongoose";

const employeeProjectSchema = new Schema(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true 
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true 
        },
        role: {
            type: String,
            required: true,
            enum: ["Developer", "Project Manager", "Tester", "Designer", "Analyst", "Other"],
            default: "Other"
        },
        allocatedHoursPerWeek: {
            type: Number,
            required: true,
            min: [1, "Allocated hours must be at least 1"],
            max: [40, "Allocated hours cannot exceed 40 per week"]
        },
        allocationStartDate: {
            type: Date,
            required: true
        },
        allocationEndDate: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ["Active", "Completed", "On Hold", "Cancelled"],
            required: true,
            default: "Active"
        }
    },
    { timestamps: true }
);

employeeProjectSchema.pre("save", function (next) {
    if (this.allocationEndDate && this.allocationEndDate < this.allocationStartDate) {
        return next(new Error("Allocation end date cannot be before the start date"));
    }
    next();
});

export const EmployeeProject = model("EmployeeProject", employeeProjectSchema);
