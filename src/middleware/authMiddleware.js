import jwt from "jsonwebtoken";
import { User } from "../models/User.js";


const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.token; 

    if (!token) {
      console.log(token);
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user and get only necessary fields
    const user = await User.findById(decoded.id).select("_id role");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Attach user details to request
    req.user = { id: user._id.toString(), role: user.role };

    return next();
  } catch (error) {
    const errorMessage =
      error.name === "JsonWebTokenError" ? "Unauthorized: Invalid token" :
      error.name === "TokenExpiredError" ? "Unauthorized: Token expired" :
      "Unauthorized: Authentication failed";

    return res.status(401).json({ message: errorMessage });
  }
};

export { authenticate };
