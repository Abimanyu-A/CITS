import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ROLES } from "../config/roles.js";

const userSchema = new Schema(
    {
        username: 
        {
            type: String,
            required: [true, 'Please provide a username'],
            unique: true,
            trim: true,
            maxlength: [50, 'Username cannot be more than 50 characters']
        },
        
        email: 
        {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            match: [
              /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
              'Please provide a valid email'
            ]
        },

        password: 
        {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false 
        },
        
        role: 
        {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.EMPLOYEE
        },

        employeeId: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
          
        departmentId: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Department'
        },
          
        teamId: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        },
          
        isActive: 
        {
            type: Boolean,
            default: true
        },
        
        firstLogin:
        {
            type: Boolean,
            default: true,
        },
          
        lastLogin: 
        {
            type: Date
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
          
        createdAt: 
        {
            type: Date,
            default: Date.now
        }
    }, 
    {
        timestamps: true
    }
);

// encrypt the passwored
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
})

// sign the JWT token
userSchema.methods.getSignedJwtToken = function(){
    return jwt.sign(
        {
            id: this._id,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

//Match user password
userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password);
};

// generate and hash reset password token
userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.virtual('employee', {
    ref: 'Employee',
    localField: 'employeeId',
    foreignField: '_id',
    justOne: true
});

export const User = model("User",userSchema);
