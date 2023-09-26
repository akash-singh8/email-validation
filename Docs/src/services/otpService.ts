import jwt from "jsonwebtoken";
import User from "../models/Users";
import sendMail from "../controllers/sendMail";
import { validationCheck } from "./linksService";
import { UserPayloadData } from "./linksService";
import { otpInputSchema } from "../validation/otpValidation";

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

  public verify = async (user: UserPayloadData, otp: string) => {
    const isValidOTP = otpInputSchema.safeParse(otp);

    if (!isValidOTP.success) {
      return {
        status: 403,
        message: isValidOTP.error.issues[0].message,
      };
    }

    const userEnteredOTP = parseInt(otp);

    try {
      const userDB = await User.findById(user.id);

      if (!userDB) throw new Error("User data not available");

      let OTP_decode;
      try {
        OTP_decode = jwt.verify(userDB.OTP!, process.env.JWT_OTP_SECRET!);
        if (typeof OTP_decode === "string") throw new Error("Invalid OTP Type");
      } catch (err) {
        return { status: 404, message: "OTP expired, resend new OTP!" };
      }

      const newPayload = {
        id: user.id,
        email: user.email,
        verified: userEnteredOTP === OTP_decode.OTP,
        banned: false,
        totalAttempts: user.attempts + 1,
      };

      const newToken = jwt.sign(newPayload, process.env.JWT_AUTH_SECRET!, {
        expiresIn: "1h",
      });

      if (newPayload.verified) {
        await User.updateOne({ _id: user.id }, { verified: true });
        return {
          status: 201,
          message: "Successfully verified",
          authToken: newToken,
        };
      }

      return { status: 404, message: "Invalid OTP", authToken: newToken };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Internal server error while verifying OTP",
      };
    }
  };
}
