import jwt from "jsonwebtoken";
import User from "../models/Users";
import sendMail from "../controllers/sendMail";

export const validationCheck = async (
  id: string,
  attempts: number,
  verified: boolean
) => {
  if (attempts >= 15) {
    await User.updateOne({ _id: id }, { banned: true });
    const token = jwt.sign(
      {
        id: id,
        verified: false,
        banned: true,
        totalAttempts: 16,
      },
      process.env.JWT_AUTH_SECRET!,
      {
        expiresIn: "1h",
      }
    );

    return {
      status: 403,
      message: "Too many attempts, the account is Banned!",
      authToken: token,
    };
  }

  if (verified) {
    return { status: 409, message: "User already verified" };
  }

  return { status: 200, message: "Validation Done" };
};

export type UserPayloadData = {
  id: string;
  email: string;
  verified: boolean;
  attempts: number;
};

export class LinkService {
  public resend = async (user: UserPayloadData) => {
    try {
      const userCheck = await validationCheck(
        user.id,
        user.attempts,
        user.verified
      );
      if (userCheck.status !== 200) {
        return userCheck;
      }

      await sendMail(user.email);
      await User.updateOne({ _id: user.id }, { $inc: { totalAttempts: 1 } });

      const token = jwt.sign(
        {
          id: user.id,
          verified: false,
          banned: false,
          totalAttempts: user.attempts + 1,
        },
        process.env.JWT_AUTH_SECRET!,
        {
          expiresIn: "1h",
        }
      );

      return {
        status: 201,
        message: `Link resend to ${user.email}`,
        authToken: token,
      };
    } catch (err) {
      console.error(err);
      return {
        status: 500,
        message: "Internal server error while resending Link",
      };
    }
  };

  public verify = async (email: string) => {
    try {
      await User.updateOne({ email: email }, { verified: true });

      return { status: 200, message: "User verified" };
    } catch (err) {
      console.error(err);
      return {
        status: 500,
        message: "Internal server error during Link verification",
      };
    }
  };
}
