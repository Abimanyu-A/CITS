import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/auth.js";
import { ACTIONS, RESOURCES } from "../config/roles.js";
import { registerEmployee } from "../controllers/employeeController.js";

const empRouter = express.Router()

empRouter.post("/register",authenticate, authorize( RESOURCES.EMPLOYEE, ACTIONS.CREATE ), registerEmployee);

export default empRouter;
