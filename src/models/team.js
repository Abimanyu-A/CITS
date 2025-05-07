import { Schema, model } from "mongoose";
import { type } from "os";

const teamSchema = new Schema(
    {
        teamName: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "Team name is required"],
            minlength: [3, "Team name must be at least 3 characters long"],
            maxlength: [50, "Team name cannot exceed 50 characters"]
        },
        teamLead: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: [true, "Team lead is required"]
        },
        dept: {
            type: Schema.Types.ObjectId,
            ref: "Dept",
            required: [true, "Department is required"]
        },
        description: {
            type: String,
            trim: true,
            maxlength: 200,
        }
    },
    {
        timestamps: true, 
        versionKey: false 
    }
);


export const Team = model("Team", teamSchema);
