import ErrorResponse from "../utils/errorResponse.js";
import { ROLES } from "../config/roles.js";
import { Dept } from "../models/deptSchema.js";
import { Employee } from "../models/employeeSchema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const create_dept = asyncHandler(async function (req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { DeptName, DeptHeadID, Budget } = req.body;
        
        if (!DeptName || !DeptHeadID || !Budget) {
            throw new ErrorResponse("Missing required fields", 400);
        }

        const dept = new Dept({
            DeptName,
            DeptHeadID,
            Budget
        });
        
        await dept.save({ session });

        const employee = await Employee.findById(DeptHeadID).populate("userID").session(session);
        if (!employee) {
            throw new ErrorResponse("Employee not found", 404);
        }
        
        const user = employee.userID;
        if (!user) {
            throw new ErrorResponse("User not found", 404);
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
        next(error);
    }
});

export const updateDept = asyncHandler(async(req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse("Invalid department ID", 400));
    }

    if (!updateData || Object.keys(updateData).length === 0) {
        return next(new ErrorResponse("No update data provided", 400));
    }

    const dept = await Dept.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!dept) {
        return next(new ErrorResponse("Department doesn't exist", 404));
    }

    res.status(200).json({
        success: true,
        message: "Department updated successfully",
        data: dept
    });
});

export const deleteDept = asyncHandler(async(req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse("Invalid department ID", 400));
    }

    const dept = await Dept.findByIdAndDelete(id);

    if (!dept) {
        return next(new ErrorResponse("Department doesn't exist", 404));
    }

    res.status(200).json({
        success: true,
        message: "Department deleted successfully",
        data: dept
    });
});

export const getAllDept = asyncHandler(async(req, res, next) => {
    const depts = await Dept.find().populate('DeptHeadID');
    
    if (!depts || depts.length < 1) {
        return next(new ErrorResponse("No departments found", 404));
    }

    res.status(200).json({
        success: true,
        count: depts.length,
        data: depts
    });
});