import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { login, register } from "../controllers/authController.js";
import { authorize } from "../middleware/auth.js";

const authRouter = express.Router()

authRouter.post("/create_employee",authenticate, authorize('create','Employee'),register);
authRouter.post("/login", login)

export default authRouter;
