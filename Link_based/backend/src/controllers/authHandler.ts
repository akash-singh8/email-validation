import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendMail from "./sendMail";
import User from "../models/Users";
import { LoginUserData, SignupUserData } from "../types/authData";
import {
  loginInputSchema,
  signupInputSchema,
} from "../validation/authValidation";

export const signupHandler = async (req: Request, res: Response) => {
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
      res.status(409).json({ message: "Email address is already in use." });
      return;
    }

    if (!process.env.JWT_AUTH_SECRET) {
      throw new Error("JWT_AUTH_SECRET environment variable is not defined.");
    }

    await sendMail(email);

    const encrypted_Pswd = await bcrypt.hash(password, 11);

    const newUser = new User({
      name,
      email,
      password: encrypted_Pswd,
      linkGenerated: 1,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_AUTH_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({ message: "Signed successfully", authToken: token });
  } catch (err) {
    res.status(500).json({ message: "Internal server error during signup" });
    console.log(err);
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const bodyData: LoginUserData = req.body;

  const isValidInput = loginInputSchema.safeParse(bodyData);

  if (!isValidInput.success) {
    res.status(400).json({
      message: isValidInput.error.issues[0].message,
      error: isValidInput.error,
    });
    return;
  }

  const { email, password } = isValidInput.data;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res
        .status(404)
        .json({ message: `The user with the email ${email} does not exist.` });
      return;
    }

    if (user.banned) {
      res.status(403).json({ message: `User ${email} is banned.` });
      return;
    }

    const isValidPswd = await bcrypt.compare(password, user.password);

    if (!isValidPswd) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    if (!process.env.JWT_AUTH_SECRET) {
      throw new Error("JWT_AUTH_SECRET environment variable is not defined.");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_AUTH_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Logged successfully", authToken: token });
  } catch (err) {
    res.status(500).json({ message: "Internal server error during login" });
    console.log(err);
  }
};
