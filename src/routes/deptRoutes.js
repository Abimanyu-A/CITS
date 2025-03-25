import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/auth.js";
import { ACTIONS, RESOURCES } from "../config/roles.js";
import { create_dept } from "../controllers/deptController.js";

const deptRouter = express.Router()

deptRouter.post("/create_dept",authenticate, authorize( RESOURCES.DEPARTMENT, ACTIONS.CREATE ), create_dept);

export default deptRouter;
