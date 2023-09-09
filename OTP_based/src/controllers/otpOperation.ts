import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/Users";
import sendMail from "./sendMail";

export const resendOTP = async (req: Request, res: Response) => {
  const user = req.body.user;

  if (!user) throw new Error("User data now available");
  if (!process.env.JWT_OTP_SECRET)
    throw new Error("JWT_OTP_SECRET environment variable is not defined.");

  try {
    const new_OTP = Math.floor(Math.random() * 999999);
    const encrypted_OTP = jwt.sign(
      { OTP: new_OTP },
      process.env.JWT_OTP_SECRET,
      {
        expiresIn: "5m",
      }
    );

    await sendMail(user.email, new_OTP);
    await User.updateOne(
      { _id: user._id },
      { OTP: encrypted_OTP, OTP_Attempt: user.OTP_Attempt + 1 }
    );

    res.status(201).json({ message: `OTP resend to ${user.email}` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error while resending OTP" });
    console.log(err);
  }
};
