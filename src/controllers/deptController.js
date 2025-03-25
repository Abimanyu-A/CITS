import { Dept } from "../models/deptSchema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const create_dept = asyncHandler(async function (req,res) {
    const { DeptName, DeptHeadID, Budget } = req.body;
    dept = await new Dept.create({
        DeptName,
        DeptHeadID,
        Budget
    });

    res.status(201).json({ success: true, data: dept});
});
