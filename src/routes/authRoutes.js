import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { login } from "../controllers/authController.js";
import { authorize } from "../middleware/auth.js";

const authRouter = express.Router()

authRouter.post("/login", login)

export default authRouter;
