import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/Users";
import sendMail from "./sendMail";

export const resendOTP = async (req: Request, res: Response) => {
  const user = req.body.user;

  if (!user) throw new Error("User data now available");

  try {
    const new_OTP = Math.floor(Math.random() * 999999);
    const encrypted_OTP = await bcrypt.hash(new_OTP.toString(10), 11);

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
