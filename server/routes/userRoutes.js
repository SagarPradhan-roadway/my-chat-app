import express from "express";
import { checkAuth, login, signup, updateprofile, forgotPassword, resetPasswordDirect, sendOtp, verifyOtpAndReset } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateprofile);
userRouter.get("/check", protectRoute, checkAuth)

// ++++++++++++++++++++++++++++++++++++++++

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password-direct", resetPasswordDirect);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtpAndReset);
// +++++++++++++++++++++++++++++++++++++++++++

export default userRouter;