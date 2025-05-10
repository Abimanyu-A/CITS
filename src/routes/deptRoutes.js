import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/auth.js";
import { ACTIONS, RESOURCES } from "../config/roles.js";
import { create_dept, deleteDept, getAllDept, getDeptVersions, revertDeptVersion, updateDept } from "../controllers/deptController.js";

const deptRouter = express.Router()

deptRouter.post("/create_dept",authenticate, authorize( RESOURCES.DEPARTMENT, ACTIONS.CREATE ), create_dept);
deptRouter.get("/departments", authenticate, authorize(RESOURCES.DEPARTMENT, ACTIONS.READ), getAllDept);
deptRouter.delete("/delete_dept/:id", authenticate, authorize(RESOURCES.DEPARTMENT, ACTIONS.DELETE), deleteDept);
deptRouter.put("/update-dept/:id", authenticate, authorize(RESOURCES.DEPARTMENT, ACTIONS.UPDATE), updateDept);
deptRouter.get("/:id/versions", authenticate, authorize(RESOURCES.DEPARTMENT, ACTIONS.UPDATE), getDeptVersions);
deptRouter.post("/:id/revert/:versionId", authenticate, authorize(RESOURCES.DEPARTMENT, ACTIONS.UPDATE), revertDeptVersion);

export default deptRouter;
