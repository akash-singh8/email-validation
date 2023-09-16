import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateLinkToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userToken: string = req.body.userToken;

  try {
    if (!userToken) {
      res.status(403).json({ message: "User verification token not found" });
      return;
    }

    if (!process.env.JWT_LINK_SECRET) {
      throw new Error("JWT_LINK_SECRET environment variable is not defined.");
    }

    let data;

    try {
      data = jwt.verify(userToken, process.env.JWT_LINK_SECRET);
      if (typeof data === "string") throw new Error("Invalid decrypted data");
    } catch (err) {
      res.status(404).json({ message: "Link expired, resend new Link!" });
      return;
    }

    req.body.email = data.email;
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error during Link verification" });
    console.error(err);
  }
};

export default authenticateLinkToken;
