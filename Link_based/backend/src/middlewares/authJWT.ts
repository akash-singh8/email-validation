import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateJWT = (
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

    req.body.userID = data.id;
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error during jwt authentication" });
    console.log(err);
  }
};
