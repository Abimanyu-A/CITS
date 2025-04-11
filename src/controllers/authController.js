import { User } from "../models/User.js";
import { Employee } from "../models/employeeSchema.js";
import ErrorResponse from "../utils/errorResponse.js";


// login 
// route: post /api/v1/auth/login

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorResponse('Please provide an email and password', 400));
        }

        const user = await User.findOne({ email }).select('+password');
        console.log(user);

        if(!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        if (!user.isActive) {
            return next(new ErrorResponse('Your account has been deactivated', 401));
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        const token = user.getSignedJwtToken();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
    
}

// logout

export const logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
      next(err);
    }
};

// get current user
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
        path: 'employee',
        select: 'firstName lastName position'
        });
        console.log(user);

        res.status(200).json({
        success: true,
        data: user
        });
    } catch (err) {
        next(err);
    }
};

// Update details
export const updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            username: req.body.username,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
        success: true,
        data: user
        });
    } catch (err) {
        next(err);
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();
  
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
  
    // Set secure flag in production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
  
    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token
    });
};