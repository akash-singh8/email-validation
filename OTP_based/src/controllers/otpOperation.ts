import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/Users";
import sendMail from "./sendMail";
import { otpInputSchema } from "../validation/otpValidation";

export const resendOTP = async (req: Request, res: Response) => {
  const user = req.body.user;

  try {
    if (!user) throw new Error("User data not available");
    if (!process.env.JWT_OTP_SECRET)
      throw new Error("JWT_OTP_SECRET environment variable is not defined.");

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

export const verifyOTP = async (req: Request, res: Response) => {
  const isValidOTP = otpInputSchema.safeParse(req.body);

  if (!isValidOTP.success) {
    res.status(400).json({
      message: isValidOTP.error.issues[0].message,
      error: isValidOTP.error,
    });
    return;
  }

  const userEnteredOTP = parseInt(isValidOTP.data.OTP);
  const user = req.body.user;

  try {
    if (!user) throw new Error("User data not available");
    if (!process.env.JWT_OTP_SECRET) {
      throw new Error("JWT_OTP_SECRET environment variable is not defined.");
    }

    let OTP_decode;

    try {
      OTP_decode = jwt.verify(user.OTP, process.env.JWT_OTP_SECRET);
      if (typeof OTP_decode === "string") throw new Error("Invalid OTP Type");
    } catch (err) {
      res.status(404).json({ message: "OTP expired, resend new OTP!" });
      return;
    }

    if (userEnteredOTP === OTP_decode.OTP) {
      await User.updateOne({ _id: user._id }, { verified: true });
      res.status(201).json({ message: "Successfully verified" });
    } else {
      await User.updateOne(
        { _id: user._id },
        { $inc: { incorrectAttempt: 1 } }
      );
      res.status(404).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error while verifying OTP" });
    console.log(err);
  }
};
