import express from "express";
import { resendOTP, verifyOTP } from "../controllers/otpOperation";
import { authenticate_OTP_Req } from "../middlewares/authOTP";

const otpRouter = express.Router();

otpRouter.patch("/resend", authenticate_OTP_Req, resendOTP);

otpRouter.patch("/verify", authenticate_OTP_Req, verifyOTP);

export default otpRouter;
