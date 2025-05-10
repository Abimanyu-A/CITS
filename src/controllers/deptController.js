import ErrorResponse from "../utils/errorResponse.js";
import { ROLES } from "../config/roles.js";
import { Dept } from "../models/deptSchema.js";
import { Employee } from "../models/employeeSchema.js";
import { DeptVersion } from "../models/deptVersion.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { User } from "../models/User.js";

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

        // Save the initial version to DeptVersion collection
        const deptVersion = new DeptVersion({
            originalId: dept._id,
            DeptName: dept.DeptName,
            DeptHeadID: dept.DeptHeadID,
            Budget: dept.Budget,
        });
        await deptVersion.save({ session });

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
        res.status(201).json({ 
            success: true, 
            data: dept,
            message: "Department created with initial version"
        });
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});


export const updateDept = asyncHandler(async(req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse("Invalid department ID", 400));
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse("No update data provided", 400));
        }

        // Find the department first to check if DeptHeadID is changing
        const currentDept = await Dept.findById(id).session(session);
        if (!currentDept) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse("Department doesn't exist", 404));
        }

        // Save current version before update
        const deptVersion = new DeptVersion({
            originalId: currentDept._id,
            DeptName: currentDept.DeptName,
            DeptHeadID: currentDept.DeptHeadID,
            Budget: currentDept.Budget,
        });
        await deptVersion.save({ session });

        // Handle role change if DeptHeadID is being updated
        if (updateData.DeptHeadID && !currentDept.DeptHeadID.equals(updateData.DeptHeadID)) {
            // Demote previous head to employee
            const previousHead = await Employee.findById(currentDept.DeptHeadID)
                .populate("userID")
                .session(session);
            
            if (previousHead?.userID && previousHead.userID.role === ROLES.MANAGER) {
                previousHead.userID.role = ROLES.EMPLOYEE;
                await previousHead.userID.save({ session });
            }

            // Promote new head to manager
            const newHead = await Employee.findById(updateData.DeptHeadID)
                .populate("userID")
                .session(session);
            
            if (!newHead) {
                throw new ErrorResponse("New department head not found", 404);
            }
            
            if (newHead.userID.role === ROLES.EMPLOYEE) {
                newHead.userID.role = ROLES.MANAGER;
                await newHead.userID.save({ session });
            }
        }

        // Update department
        const updatedDept = await Dept.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true, session }
        ).populate('DeptHeadID');

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Department updated successfully. New version created.",
            data: updatedDept
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});

export const deleteDept = asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse("Invalid department ID", 400));
        }

        const dept = await Dept.findById(id).session(session);
        if (!dept) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse("Department doesn't exist", 404));
        }

        // Save the version before deletion
        const deptVersion = new DeptVersion({
            originalId: dept._id,
            DeptName: dept.DeptName,
            DeptHeadID: dept.DeptHeadID,
            Budget: dept.Budget,
        });
        await deptVersion.save({ session });

        // Demote department head before deletion
        if (dept.DeptHeadID) {
            const employee = await Employee.findById(dept.DeptHeadID)
                .populate("userID")
                .session(session);
            
            if (employee?.userID && employee.userID.role === ROLES.MANAGER) {
                employee.userID.role = ROLES.EMPLOYEE;
                await employee.userID.save({ session });
            }
        }

        // Delete the department
        await Dept.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Department deleted successfully",
            data: dept
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});


export const getAllDept = asyncHandler(async(req, res, next) => {
    const depts = await Dept.find().populate('DeptHeadID').populate("HandlingTeams");
    
    if (!depts || depts.length < 1) {
        return next(new ErrorResponse("No departments found", 404));
    }

    res.status(200).json({
        success: true,
        count: depts.length,
        data: depts
    });
});

export const getDeptVersions = asyncHandler(async(req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse("Invalid department ID", 400));
    }

    const versions = await DeptVersion.find({ originalId: id })
        .sort('-versionedAt')
        .select('-__v -originalId');

    if (!versions || versions.length === 0) {
        return next(new ErrorResponse("No version history found", 404));
    }

    res.status(200).json({
        success: true,
        count: versions.length,
        data: versions
    });
});


export const revertDeptVersion = asyncHandler(async(req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id, versionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(versionId)) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse("Invalid ID(s)", 400));
        }

        // Find the version to revert to
        const version = await DeptVersion.findOne({ originalId: id, _id: versionId }).session(session);

        if (!version) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse("Version not found", 404));
        }

        // Update the department with the version data
        const revertedDept = await Dept.findByIdAndUpdate(
            id,
            {
                DeptName: version.DeptName,
                DeptHeadID: version.DeptHeadID,
                Budget: version.Budget
            },
            { new: true, runValidators: true, session }
        ).populate('DeptHeadID');

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Department reverted to selected version",
            data: revertedDept
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});
``
