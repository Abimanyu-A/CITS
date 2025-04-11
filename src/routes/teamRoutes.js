import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/auth.js";
import { ACTIONS, RESOURCES } from "../config/roles.js";
import { createTeam } from "../controllers/teamController.js";

const teamRouter = express.Router();

teamRouter.post("/create", authenticate, authorize(RESOURCES.TEAM, ACTIONS.CREATE), createTeam);

export default teamRouter;