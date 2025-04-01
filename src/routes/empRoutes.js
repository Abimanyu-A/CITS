import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/auth.js";
import { ACTIONS, RESOURCES } from "../config/roles.js";
import { activateEmployee, deactivateEmployee, registerEmployee, updateDeptAndTeam, updateProfile } from "../controllers/employeeController.js";

const empRouter = express.Router()

empRouter.post("/register",authenticate, authorize( RESOURCES.EMPLOYEE, ACTIONS.CREATE ), registerEmployee);
empRouter.put("/delete/:id",authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.DELETE), deactivateEmployee);
empRouter.put("/dept-and-team-details/:id", authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.UPDATE), updateDeptAndTeam);
empRouter.put("/update-profile/:id", authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.UPDATE), updateProfile);
empRouter.put("/activate/:id", authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.MANAGE), activateEmployee);

export default empRouter;
