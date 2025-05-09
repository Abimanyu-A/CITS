import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getMe, login } from "../controllers/authController.js";

const authRouter = express.Router()

authRouter.post("/login", login);
authRouter.get("/me", authenticate, getMe);

export default authRouter;
