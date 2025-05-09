import { Team } from "../models/team.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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
    const teams = await Team.find();
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
        { new: true, runValidators: true}
    );

    if (!team) {
        return res.status(404).json({ message: "Team doesn't exist" });
    }

    return res.status(200).json({
        message: "Team updated successfully",
        data: team
    });
});