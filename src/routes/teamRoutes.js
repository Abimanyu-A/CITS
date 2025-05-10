import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/auth.js";
import { ACTIONS, RESOURCES } from "../config/roles.js";
import { assignTeamToDept, createTeam, deleteTeam, getAllTeams, updateTeam } from "../controllers/teamController.js";

const teamRouter = express.Router();

teamRouter.post("/create", authenticate, authorize(RESOURCES.TEAM, ACTIONS.CREATE), createTeam);
teamRouter.get("/get-all-teams", authenticate, authorize(RESOURCES.TEAM, ACTIONS.READ), getAllTeams);
teamRouter.delete("/delete-team/:id", authenticate, authorize(RESOURCES.TEAM, ACTIONS.DELETE), deleteTeam);
teamRouter.put("/update-team/:id", authenticate, authorize(RESOURCES.TEAM, ACTIONS.UPDATE), updateTeam);
teamRouter.put("/:teamId/assign-dept", authenticate, authorize(RESOURCES.TEAM, ACTIONS.UPDATE), assignTeamToDept);

export default teamRouter;