import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const employeeSchema = new Schema(
    {

        firstName: 
        {
            type: String,
            required: [true, 'Please provide first name'],
            trim: true,
            maxlength: [50, 'First name cannot be more than 50 characters']
        },
        lastName: 
        {
            type: String,
            required: [true, 'Please provide last name'],
            trim: true,
            maxlength: [50, 'Last name cannot be more than 50 characters']
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
        phone: 
        {
            type: String,
            sparse: true,
            maxlength: [20, 'Phone number cannot be more than 20 characters']
        },
        dob: 
        {
            type: Date
        },
        address: 
        {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        
        position: 
        {
            type: String,
            required: [true, 'Please provide position']
        },
        
        departmentId: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Department',
        },
        
        managerId: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Employee'
        },
        
        teamId: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        },

        hireDate: 
        {
            type: Date,
            default: Date.now
        },
          
        salary: 
        {
            type: Number,
            required: [true, 'Please provide salary']
        },
          
        employmentStatus: 
        {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Terminated'],
            default: 'Full-time'
        },
          
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String
          
        },
          
        documents: [
            {
                name: String,
                type: String,
                url: String,
                uploadDate: 
                {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        skills: [
            {
                type: String,
                trim: true
            }
        ],

        isActive: 
        {
            type: Boolean,
            default: true
        },
          
        terminationDate: 
        {
            type: Date
        },
          
        photo: 
        {
            type: String,
            default: 'default.jpg'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

employeeSchema.virtual('projects',{
    ref: 'EmployeeProject',
    localField: '_id',
    foreignField: 'employeeId',
    justOne: false
});

employeeSchema.virtual('attendance', {
    ref: 'Attendance',
    localField: '_id',
    foreignField: 'employeeId',
    justOne: false
});

employeeSchema.virtual('sales',{
    ref: 'sale',
    localField: '_id',
    foreignField: 'employeeId',
    justOne: false
});

employeeSchema.index({ firstName: 1, lastName: 1 });
employeeSchema.index({ departmentId: 1 });
employeeSchema.index({ managerId: 1 });
employeeSchema.index({ teamId: 1 });

export const Employee = model("Employee", employeeSchema);