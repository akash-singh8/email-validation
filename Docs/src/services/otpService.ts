import jwt from "jsonwebtoken";
import User from "../models/Users";
import sendMail from "../controllers/sendMail";
import { validationCheck } from "./linksService";
import { UserPayloadData } from "./linksService";

export class OTPService {
  public resend = async (user: UserPayloadData) => {
    try {
      if (!user) throw new Error("User data not available");
      if (!process.env.JWT_OTP_SECRET)
        throw new Error("JWT_OTP_SECRET environment variable is not defined.");

      const userCheck = await validationCheck(user);
      if (userCheck.status !== 200) {
        return userCheck;
      }

      const new_OTP = Math.floor(Math.random() * 999999);
      const encrypted_OTP = jwt.sign(
        { OTP: new_OTP },
        process.env.JWT_OTP_SECRET,
        {
          expiresIn: "5m",
        }
      );

      await sendMail(user, new_OTP);
      await User.updateOne(
        { _id: user.id },
        { OTP: encrypted_OTP, totalAttempts: user.attempts + 1 }
      );

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
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
        message: `OTP resend to ${user.email}`,
        authToken: token,
      };
      // send new token
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Internal server error while resending OTP",
      };
    }
  };
}
