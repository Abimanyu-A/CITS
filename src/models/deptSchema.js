import { Schema, model } from "mongoose";
import version from "mongoose-version";

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
            ref: "Team"
        }]
    },
    { timestamps: true }
);

deptSchema.plugin(version, {
  collection: 'DeptVersions', 
  suppressVersionIncrement: false,
  maxVersions: 10
});

export const Dept = model("Dept", deptSchema);