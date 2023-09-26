import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { validationCheck } from "../services/linksService";

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

    let user;

    try {
      user = jwt.verify(token, process.env.JWT_AUTH_SECRET);
    } catch (err) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    if (typeof user === "string") throw new Error("Invalid jwt data");

    if (!user || user.banned) {
      res.status(403).json({
        message: `The user account is ${user ? "banned" : "deleted"}.`,
      });
      return;
    }

    const userCheck = await validationCheck({
      id: user.id,
      email: user.email,
      verified: false,
      attempts: user.totalAttempts,
    });

    if (userCheck.status !== 200) {
      res
        .status(userCheck.status)
        .json({ message: userCheck.message, authToken: userCheck.authToken });
      return;
    }

    req.body.user = user;
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error during jwt otp authentication" });
    console.log(err);
  }
};
