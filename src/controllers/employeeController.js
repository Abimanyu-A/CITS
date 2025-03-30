import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Employee } from "../models/employeeSchema.js";
import { User } from "../models/User.js";
import { sendWelcomeEmail } from "../config/mailer.js";
import { v4 as uuidv4 } from "uuid";

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
            employeeId: newEmployee._id, // Explicitly set the employeeId
        });
        await newUser.save();

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