import jwt from "jsonwebtoken";
import { UserPayloadData } from "../services/linksService";

export const generateLink = (user: UserPayloadData): string | undefined => {
  try {
    if (!process.env.JWT_LINK_SECRET) {
      throw new Error("JWT_LINK_SECRET environment variable is not defined.");
    }

    if (!process.env.BASE_URL) {
      throw new Error("BASE_URL environment variable is not defined.");
    }

    const link = jwt.sign(
      {
        id: user.id,
        email: user.email,
        verified: false,
        banned: false,
        totalAttempts: user.attempts + 1,
      },
      process.env.JWT_LINK_SECRET,
      {
        expiresIn: "5m",
      }
    );

    return process.env.BASE_URL + link;
  } catch (err) {
    console.log("Error while generating link");
    console.error(err);
  }
};
