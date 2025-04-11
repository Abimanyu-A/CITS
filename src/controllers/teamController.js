import { Team } from "../models/team.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const createTeam = asyncHandler(async(req, res) => {
    const { teamName, teamLead, dept } = req.body;
    if(!teamName || !teamLead || !dept ){
        return res.status(400).json({ message: "All details must be provided" });
    }

    const existingTeam = await Team.findOne({ teamName });
    if(existingTeam){
        return res.status(400).json({ message: "Team name already exists"});
    }
    const team = new Team({
        teamName,
        teamLead,
        dept
    });

    

    await team.save();
    return res.status(201).json({ 
        success: true,
        message: "Team created successfully",
        data: team
    });
});