import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ROLES } from "../config/roles.js"; 
import { Employee } from "../models/employeeSchema.js";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        console.log(`Connecting to MongoDB: ${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        await mongoose.connect("mongodb://localhost:27017/cits");
        console.log("✅ MongoDB connected...");
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1);
    }
};

// Seed CEO user
const seedCEO = async () => {
    try {
        await connectDB();

        // Check if a CEO already exists
        const existingCEO = await User.findOne({ role: ROLES.CEO });
        if (existingCEO) {
            console.log("✅ CEO already exists.");
            return;
        }

        // Create a minimal Employee record for the CEO
        const ceoEmployee = new Employee({
            firstName: "Johny",
            lastName: "Black",
            position: "CEO",
            email: "ceo@me.com",
            departmentId: null,
            salary: 0,
        });
        await ceoEmployee.save();

        // Create CEO user
        const ceoUser = new User({
            username: "ceo_me",
            email: "ceo@me.com",
            password: "itsme@123",
            role: ROLES.CEO,
            employeeId: ceoEmployee._id,
            isActive: true
        });

        await ceoUser.save();
        console.log("🎉 CEO user created successfully.");
    } catch (err) {
        console.error("❌ Error seeding CEO:", err);
    } finally {
        mongoose.connection.close();
        console.log("🔌 MongoDB connection closed.");
    }
};

// Run the script
seedCEO();
