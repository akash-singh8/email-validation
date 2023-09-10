import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/Users";
import sendMail from "./sendMail";

export const generateLink = (email: string): string | undefined => {
  try {
    if (!process.env.JWT_OTP_SECRET) {
      throw new Error("JWT_OTP_SECRET environment variable is not defined.");
    }

    if (!process.env.BASE_URL) {
      throw new Error("BASE_URL environment variable is not defined.");
    }

    const link = jwt.sign({ email }, process.env.JWT_OTP_SECRET, {
      expiresIn: "5m",
    });

    return process.env.BASE_URL + link;
  } catch (err) {
    console.log("Error while generating link");
    console.error(err);
  }
};

const getUser = async (userID: string, res: Response) => {
  const user = await User.findById(userID);

  if (!user || user.banned) {
    res.status(403).json({
      message: `The user account is ${user ? "banned" : "deleted"}.`,
    });
    return;
  }

  if (user.linkGenerated >= 7) {
    await User.updateOne({ _id: user._id }, { banned: true });

    res.status(403).json({
      message: "Too many attempts, the account is Banned!",
    });
    return;
  }

  if (user.verified) {
    res.status(404).json({
      message: `${user.email} is already verified`,
    });
    return;
  }

  return user;
};

export const resendLink = async (req: Request, res: Response) => {
  const userID = req.body.userID;

  try {
    if (!userID) throw new Error("User id not found");

    const user = await getUser(userID, res);
    if (!user) return;

    await User.updateOne({ _id: user._id }, { $inc: { linkGenerated: 1 } });
    await sendMail(user.email);

    res.status(201).json({ message: `Link resend to ${user.email}` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error while resending Link" });
    console.error(err);
  }
};
