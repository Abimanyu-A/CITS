import { ROLES } from "../config/roles.js";
import { Dept } from "../models/deptSchema.js";
import { Employee } from "../models/employeeSchema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const create_dept = asyncHandler(async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { DeptName, DeptHeadID, Budget } = req.body;
        
        const dept = new Dept({
            DeptName,
            DeptHeadID,
            Budget
        });
        
        await dept.save({ session });

        const employee = await Employee.findById(DeptHeadID).populate("userID").session(session);
        if (!employee) {
            throw new Error("Employee not found");
        }
        
        const user = employee.userID;
        if (!user) {
            throw new Error("User not found");
        }

        if (user.role === ROLES.EMPLOYEE) {
            user.role = ROLES.MANAGER;
            await user.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, data: dept });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
});
