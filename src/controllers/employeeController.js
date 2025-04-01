import { Employee } from "../models/employeeSchema.js";
import { User } from "../models/User.js";
import { sendWelcomeEmail } from "../config/mailer.js";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../utils/asyncHandler.js";

// Generate a unique username
const generateUsername = (lastname) => {
    const uniqueId = uuidv4().slice(0, 6);
    return `${lastname.toLowerCase()}${uniqueId}`;
};

// Generate a secure password
const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + "@1A";
};

export const registerEmployee = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, position, salary, role } = req.body;

        if (!firstName || !lastName || !email || !position || !salary) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee with this email already exists" });
        }

        // Create new employee
        const newEmployee = new Employee({ 
            firstName, 
            lastName, 
            email, 
            phone, 
            position, 
            salary 
        });
        await newEmployee.save();

        const generatedUsername = generateUsername(lastName);
        const generatedPassword = generatePassword();

        const newUser = new User({
            username: generatedUsername,
            email,
            password: generatedPassword,
            role: role || "employee",
            employeeId: newEmployee._id,
        });
        await newUser.save();

        newEmployee.userID = newUser._id;
        await newEmployee.save();

        sendWelcomeEmail(email, generatedUsername, generatedPassword);

        return res.status(201).json({
            message: "Employee registered successfully",
            employee: newEmployee,
            user: newUser,
        });
    } catch (error) {
        console.error("Error in registerEmployee:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            errorDetails: error.message 
        });
    }
};

// update employee details
export const updateProfile = asyncHandler(async (req,res) => {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await Employee.findById(id);
    if(!employee)
        return res.status(404).json({message: "Employee not found"});

    Object.keys(updateData).forEach((key)=>{
        employee[key] = updateData[key];
    });

    await employee.save();

    return res.status(200).json({
        message: "Employee updated successfully",
        employee
    });
});

// delete an employee
export const deactivateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.userID) {
        await User.findByIdAndUpdate(employee.userID, { isActive: false });
    }

    await Employee.findByIdAndUpdate(id, { isActive: false });

    return res.status(200).json({ message: "Employee deactivated successfully" });
});


export const updateDeptAndTeam = asyncHandler( async(req, res) => {
    const { id } = req.params;
    const { departmentId, teamId } = req.body;

    const employee = await Employee.findById(id);

    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }

    if(departmentId){
        employee.departmentId = departmentId;
    }

    if(teamId){
        employee.teamId = teamId;
    }

    await employee.save();

    return res.status(200).json({
        message: "Employee updated successfully",
        employee,
    });
});

export const activateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id)
        .populate({ path: "userID", select: "isActive" })
        .exec();

    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }

    console.log("Employee before activation:", employee);

    if (!employee.isActive) {
        employee.isActive = true;
    }

    if (employee.userID && !employee.userID.isActive) {
        await User.findByIdAndUpdate(employee.userID._id, { isActive: true }, { new: true });
    }

    await employee.save();

    return res.status(200).json({ message: "Employee activated successfully" });
});
