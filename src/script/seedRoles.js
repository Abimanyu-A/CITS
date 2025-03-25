import mongoose from "mongoose";
import dotenv from "dotenv";
import { Role } from "../models/roleSchema.js";
dotenv.config();

const seedRoles = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/cits");

        const roles = [
            { name: "Admin", permissions: ["MANAGE_EMPLOYEES", "VIEW_REPORTS"] },
            { name: "Manager", permissions: ["CREATE_EMPLOYEE","VIEW_REPORTS", "MANAGE_PROJECTS"] },
            { name: "Employee", permissions: ["VIEW_PROFILE"] }
        ];

        await Role.insertMany(roles);
        console.log("Roles seeded successfully");
        process.exit();
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedRoles();
