import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/Users";
import { UserPayloadData } from "../services/linksService";

export const validationCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user: UserPayloadData = req.body.user;

  if (user.attempts >= 15) {
    await User.updateOne({ _id: user.id }, { banned: true });
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        verified: false,
        banned: true,
        totalAttempts: 16,
      },
      process.env.JWT_AUTH_SECRET!,
      {
        expiresIn: "1h",
      }
    );

    return res.status(403).json({
      message: "Too many attempts, the account is Banned!",
      authToken: token,
    });
  }

  if (user.verified) {
    return res.status(409).json({ message: "User already verified" });
  }

  next();
};
