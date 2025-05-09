import { Employee } from "../models/employeeSchema.js";
import { User } from "../models/User.js";
import { Dept } from "../models/deptSchema.js";
import { Team } from "../models/team.js";
import { sendWelcomeEmail } from "../config/mailer.js";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { startSession } from "mongoose";
import { uploadMultipleFiles, uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { firstName, lastName, email, phone, position, salary, role } = req.body;

        if (!firstName || !lastName || !email || !position || !salary) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const existingEmployee = await Employee.findOne({ email }).session(session);
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee with this email already exists" });
        }

        const newEmployee = new Employee({ 
            firstName, 
            lastName, 
            email, 
            phone, 
            position, 
            salary 
        });
        await newEmployee.save({ session });

        const generatedUsername = generateUsername(lastName);
        const generatedPassword = generatePassword();

        const newUser = new User({
            username: generatedUsername,
            email,
            password: generatedPassword,
            role: role || "employee",
            employeeId: newEmployee._id,
        });
        await newUser.save({ session });

        newEmployee.userID = newUser._id;
        await newEmployee.save({ session });

        await sendWelcomeEmail(email, generatedUsername, generatedPassword);

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Employee registered successfully",
            employee: newEmployee,
            user: newUser,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in registerEmployee:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            errorDetails: error.message 
        });
    }
};

export const deactivateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const employee = await Employee.findById(id).session(session);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if (employee.userID) {
            await User.findByIdAndUpdate(employee.userID, { isActive: false }, { session });
        }

        await Employee.findByIdAndUpdate(id, { isActive: false }, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Employee deactivated successfully" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

export const activateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const employee = await Employee.findById(id)
            .populate({ path: "userID", select: "isActive" })
            .session(session);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if (!employee.isActive) {
            employee.isActive = true;
        }

        if (employee.userID && !employee.userID.isActive) {
            await User.findByIdAndUpdate(employee.userID._id, { isActive: true }, { session, new: true });
        }

        await employee.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Employee activated successfully" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

export const getAllEmployee = asyncHandler(async(req, res) => {
    const employees = await Employee.find()
    .populate({
        path: "departmentId",
        select: "DeptName"
    })
    .populate({
        path: "teamId",
        select: "teamName"
    })
    .populate({
        path: "userID",
        select: "role"
    })
    .select("-createdAt -updatedAt -__v")

    if(employees.length<=0){
        return res.status(404).json({message: "There are no employees"});
    }

    return res.status(200).json({
        success: true,
        data: employees
    })
})

export const updateDept = asyncHandler(async(req,res) => {
    const { id } = req.params;
    const { newDept } = req.body;
    const employee = await Employee.findByIdAndUpdate(id, { departmentId: newDept }, {
        new: true,
        runValidators: true
    });

    if(!employee){
        return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
        success: true,
        data: employee
    });

})

export const updateTeam = asyncHandler(async(req,res) => {
    const { id } = req.params;
    const { newTeam } = req.body;
    const employee = await Employee.findByIdAndUpdate(id, { teamId: newTeam }, {
        new: true,
        runValidators: true
    });

    if(!employee){
        return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
        success: true,
        data: employee
    });

});

export const updateProfile = asyncHandler(async(req,res) => {
    const { id } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const newDetails = req.body;
        const existedUser = await Employee.findById(id)

        if(!existedUser){
            return res.status(404).json({ message: "Employee not found"});
        }

        ['address', 'emergencyContact', 'skills'].forEach((field) => {
            if (typeof newDetails[field] === 'string') {
              newDetails[field] = JSON.parse(newDetails[field]);
            }
          });

        let photo = null;
        if(req.files?.photo && req.files.photo.length > 0){
            const photoLocalPath = req.files?.photo[0]?.path;
            if(!photoLocalPath){
                return res.status(400).json({ message: "Photo is required" });
            }

            photo = await uploadOnCloudinary(photoLocalPath,existedUser.photo);
            
            //delete the local photoo
            fs.unlinkSync(photoLocalPath);
        }
        

        //Handling documents upload
        const documentPaths = req.files?.documents?.map(doc => doc.path);
        if(documentPaths?.length>0){
            const uploadDocuments = await uploadMultipleFiles(documentPaths);
            existedUser.documents.push(...uploadDocuments);

            documentPaths.forEach(path => fs.unlinkSync(path));
        }

        Object.keys(newDetails).forEach((key) => {
            existedUser[key] = newDetails[key];
        });

        if (photo) {
            existedUser.photo = photo;
        }

        const user = await User.findByIdAndUpdate(
            existedUser.userID,
            {
                $set: {
                    firstLogin: false
                },

            },
            {
                new: true,
                runValidators: true
            }
        )
    
        await existedUser.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ 
            message: "Sucessfully updated",
            employee: existedUser,
        });
        
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).send('Something went wrong');
    }
});

export const getCurrentEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findOne({ userID: id });

    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
        success: true,
        data: employee
    });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const employee = await Employee.findByIdAndDelete(id).session(session);
        if (!employee) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Employee not found' });
        }

        await User.findByIdAndUpdate(
            employee.userID,
            { isActive: false },
            {
                new: true,
                runValidators: true,
                session
            }
        );

        await session.commitTransaction();
        res.status(200).json({ message: 'Employee deleted and user deactivated', data: employee });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    } finally {
        session.endSession();
    }
});

