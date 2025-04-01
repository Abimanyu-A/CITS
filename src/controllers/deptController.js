import { ROLES } from "../config/roles.js";
import { Dept } from "../models/deptSchema.js";
import { Employee } from "../models/employeeSchema.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const create_dept = asyncHandler(async function (req,res) {
    const { DeptName, DeptHeadID, Budget } = req.body;
    const dept = new Dept({
        DeptName,
        DeptHeadID,
        Budget
    });

    await dept.save();

    const userId = await Employee.findById(DeptHeadID).select("userID");
    const user = await User.findById(userId.userID);
    if (user.role === ROLES.EMPLOYEE)
        user.role = ROLES.MANAGER;

    await user.save();

    res.status(201).json({ success: true, data: dept});
});
