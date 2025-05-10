import { Schema, model } from "mongoose";

const deptSchema = new Schema(
    {
        DeptName: { 
            type: String, 
            required: true, 
            unique: true 
        },
        DeptHeadID : { 
            type: Schema.Types.ObjectId, 
            ref: "Employee" 
        },
        Budget: { 
            type: Number, 
            required: true 
        },
        HandlingTeams: [{
            type: Schema.Types.ObjectId,
            ref: "Team",
            default: [],
            
        }]
    },
    { timestamps: true }
);


export const Dept = model("Dept", deptSchema);