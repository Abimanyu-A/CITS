import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/auth.js";
import { ACTIONS, RESOURCES } from "../config/roles.js";
import { activateEmployee, deactivateEmployee, getCurrentEmployee, registerEmployee, updateDept, updateProfile, updateTeam } from "../controllers/employeeController.js";
import { upload } from "../middleware/multerMiddleware.js";

const empRouter = express.Router()

empRouter.post("/register",authenticate, authorize( RESOURCES.EMPLOYEE, ACTIONS.CREATE ), registerEmployee);
empRouter.put("/delete/:id",authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.DELETE), deactivateEmployee);
empRouter.put("/dept-details/:id", authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.UPDATE), updateDept);
empRouter.put("/dept-teams/:id", authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.UPDATE), updateTeam);
empRouter.get("/get-employee/:id", authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.READ), getCurrentEmployee);

empRouter.put("/update-profile/:id", authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.UPDATE), upload.fields(
    [{ 
        name: "photo", 
        maxCount: 1 
    },
    {
        name: "documents",
        maxCount: 5
    }]), 
    updateProfile
);

empRouter.put("/activate/:id", authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.MANAGE), activateEmployee);

export default empRouter;
