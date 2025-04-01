import { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true 
        },
        attendanceDate: {
            type: Date,
            required: true,
            default: Date.now,
            index: true 
        },
        attendanceStatus: {
            type: String,
            enum: ["present", "absent"],
            required: true
        },
        clockInTime: {
            type: Date,
            default: null,
            validate: {
                validator: function (v) {
                    return v === null || v instanceof Date;
                },
                message: "clockInTime must be a valid Date or null"
            }
        },
        clockOutTime: {
            type: Date,
            default: null,
            validate: {
                validator: function (v) {
                    return v === null || v instanceof Date;
                },
                message: "clockOutTime must be a valid Date or null"
            }
        },
        hoursWorked: {
            type: Number,
            default: 0,
            min: [0, "hoursWorked cannot be negative"],
            max: [24, "hoursWorked cannot exceed 24 hours"]
        },
        workLocation: {
            type: String,
            enum: ["Office", "Remote", "Field"],
            default: "Office"
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    { 
        timestamps: true
    }
);

// Ensure clockOutTime is always after clockInTime
attendanceSchema.pre("save", function (next) {
    if (this.clockInTime && this.clockOutTime && this.clockOutTime < this.clockInTime) {
        return next(new Error("Clock-out time cannot be earlier than clock-in time"));
    }
    next();
});

// Auto-calculate hoursWorked before saving
attendanceSchema.pre("save", function (next) {
    if (this.clockInTime && this.clockOutTime) {
        this.hoursWorked = (this.clockOutTime - this.clockInTime) / (1000 * 60 * 60); 
    }
    next();
});

export const Attendance = model("Attendance", attendanceSchema);
