import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/Users";

export const authenticate_OTP_Req = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : "";

  if (!token) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    if (!process.env.JWT_AUTH_SECRET) {
      throw new Error("JWT_AUTH_SECRET environment variable is not defined.");
    }

    let data;

    try {
      data = jwt.verify(token, process.env.JWT_AUTH_SECRET);
    } catch (err) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    if (typeof data === "string") throw new Error("Invalid jwt data");

    const user = await User.findById(data.id);

    if (!user || user.banned) {
      res.status(403).json({
        message: `The user account is ${user ? "banned" : "deleted"}.`,
      });
      return;
    }

    if (user.verified) {
      res.status(404).json({
        message: `${user.email} is already verified`,
      });
      return;
    }

    if (user.incorrectAttempt >= 7 || user.OTP_Attempt >= 10) {
      await User.updateOne({ _id: user._id }, { banned: true });

      res.status(403).json({
        message: "Too many OTP attempts, the account is Banned!",
      });
      return;
    }

    req.body.user = user;
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error during jwt authentication" });
    console.log(err);
  }
};
