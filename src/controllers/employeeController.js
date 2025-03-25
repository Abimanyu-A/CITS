import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Employee } from "../models/employeeSchema.js";
import { User } from "../models/User.js";
import { sendEmail } from "../config/mailer.js";
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
        // Extracting values from request body
        const { firstName, lastName, email, phone, position, salary, role } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !position || !salary) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Check if employee already exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee with this email already exists" });
        }

        // Create new Employee record
        const newEmployee = await Employee.create({ firstName, lastName, email, phone, position, salary });

        const generatedUsername = generateUsername(lastName);
        const generatedPassword = generatePassword();

        // Create User record linked to Employee
        const newUser = await User.create({
            username: generatedUsername,
            email,
            password: generatedPassword,
            role: role || "employee",
            employeeId: newEmployee._id
        });

        // Send welcome email
        await sendEmail(
            email,
            "Welcome to the Company!",
            `Hi ${firstName},\n\nYour account has been created successfully. Your login username is ${newUser.username} and your temporary password is ${generatedPassword}. Please reset your password after logging in.`,
            `<p>Hi <strong>${firstName}</strong>,</p><p>Your account has been created successfully. Your login username is <strong>${newUser.username}</strong> and your temporary password is <strong>${generatedPassword}</strong>. Please reset your password after logging in.</p>`
        );

        return res.status(201).json({
            message: "Employee registered successfully",
            employee: newEmployee,
            user: newUser
        });

    } catch (error) {
        console.error("Error in registerEmployee:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
