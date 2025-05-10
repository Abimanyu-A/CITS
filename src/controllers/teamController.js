import { Dept } from "../models/deptSchema.js";
import { Team } from "../models/team.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const assignTeamToDept = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { deptId } = req.body;
    console.log(teamId)
    console.log(deptId)

    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            throw new Error("Invalid team ID");
        }

        if (!mongoose.Types.ObjectId.isValid(deptId)) {
            throw new Error("Invalid department ID");
        }

        // Find and update the team document
        const team = await Team.findByIdAndUpdate(
            teamId,
            { dept: deptId },
            { new: true, runValidators: true, session }
        ).populate('dept teamLead');

        if (!team) {
            throw new Error("Team not found");
        }

        // Find and update the department document
        const dept = await Dept.findByIdAndUpdate(
            deptId,
            { $push: { HandlingTeams: teamId } },
            { new: true, runValidators: true, session }
        ).populate("HandlingTeams");

        if (!dept) {
            throw new Error("Department not found");
        }

        console.log(dept)

        // Commit the transaction
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Team assigned to department successfully",
            data: team,
        });
    } catch (error) {
        // If there is an error, abort the transaction
        await session.abortTransaction();
        return res.status(400).json({
            success: false,
            message: error.message || "An error occurred",
        });
    } finally {
        // End the session
        session.endSession();
    }
});

export const updateTeamMembers = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { members } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
    }

    if (!Array.isArray(members)) {
        return res.status(400).json({ message: "Members must be an array" });
    }

    // Validate all member IDs
    for (const memberId of members) {
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: `Invalid member ID: ${memberId}` });
        }
    }

    const team = await Team.findByIdAndUpdate(
        teamId,
        { members },
        { new: true, runValidators: true }
    ).populate('department teamLead members');

    if (!team) {
        return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({
        success: true,
        message: "Team members updated successfully",
        data: team
    });
});

// Existing controller functions (keep these as they are)
export const createTeam = asyncHandler(async(req, res) => {
    const { name, teamLead, department, description } = req.body;
    if(!name || !teamLead || !department || !description ){
        return res.status(400).json({ message: "All details must be provided" });
    }

    const existingTeam = await Team.findOne({ name });
    if(existingTeam){
        return res.status(400).json({ message: "Team name already exists"});
    }
    const team = new Team({
        teamName: name,
        teamLead,
        dept: department,
        description
    });

    await team.save();
    return res.status(201).json({ 
        success: true,
        message: "Team created successfully",
        data: team
    });
});

export const getAllTeams = asyncHandler(async(req,res) => {
    const teams = await Team.find().populate('dept teamLead');
    if (teams?.length<1) {
        return res.status(404).json({message: "No teams created yet"})
    }
    return res.status(200).json({
        data: teams
    })
});

export const deleteTeam = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);

    if(!team) {
        return res.status(404).json({message: "Team doesn't exist"});
    }

    return res.status(200).json({
        message: "Team deleted successfully",
        data: team
    });
});

export const updateTeam = asyncHandler(async(req,res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No update data provided" });
    }

    const team = await Team.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).populate('dept teamLead');

    if (!team) {
        return res.status(404).json({ message: "Team doesn't exist" });
    }

    return res.status(200).json({
        message: "Team updated successfully",
        data: team
    });
});