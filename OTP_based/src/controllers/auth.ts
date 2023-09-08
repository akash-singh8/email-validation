import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/Users";
import sendMail from "../controllers/sendMail";
import { signupInputSchema } from "../validation/authValidation";
import { SignupUserData } from "../types/authData";

export const handleSignup = async (req: Request, res: Response) => {
  const bodyData: SignupUserData = req.body;

  const isValidInput = signupInputSchema.safeParse(bodyData);

  if (!isValidInput.success) {
    res.status(400).json({
      message: isValidInput.error.issues[0].message,
      error: isValidInput.error,
    });
    return;
  }

  const { name, email, password } = isValidInput.data;

  try {
    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(409)
        .json({ message: "Email address is already in use." });
    }

    const jwtOtpSecret = process.env.JWT_OTP_SECRET;
    const jwtAuthSecret = process.env.JWT_AUTH_SECRET;

    if (!jwtOtpSecret || !jwtAuthSecret) {
      throw new Error("JWT_SECRET environment variable is not defined.");
    }

    const OTP = Math.floor(Math.random() * 999999);
    await sendMail(email, OTP);

    const encrypted_OTP = jwt.sign({ OTP: OTP, attempt: 0 }, jwtOtpSecret, {
      expiresIn: "5m",
    });
    const encrypted_Pswd = await bcrypt.hash(password, 11);

    const newUser = new User({
      name,
      email,
      password: encrypted_Pswd,
      OTP: encrypted_OTP,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, jwtAuthSecret, {
      expiresIn: "1h",
    });
    res.status(201).json({ message: "Signed successfully", authToken: token });
  } catch (err) {
    res.status(500).json({ message: "Internal server error on signup" });
    console.log(err);
  }
};