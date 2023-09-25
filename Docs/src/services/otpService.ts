import jwt from "jsonwebtoken";
import User from "../models/Users";
import sendMail from "../controllers/sendMail";

export class OTPService {
  public resend = async (user: {
    id: string;
    email: string;
    totalAttempts: number;
  }) => {
    try {
      if (!user) throw new Error("User data not available");
      if (!process.env.JWT_OTP_SECRET)
        throw new Error("JWT_OTP_SECRET environment variable is not defined.");

      const new_OTP = Math.floor(Math.random() * 999999);
      const encrypted_OTP = jwt.sign(
        { OTP: new_OTP },
        process.env.JWT_OTP_SECRET,
        {
          expiresIn: "5m",
        }
      );

      await sendMail(user.email, new_OTP);
      await User.updateOne(
        { _id: user.id },
        { OTP: encrypted_OTP, totalAttempts: user.totalAttempts + 1 }
      );

      return { status: 201, message: `OTP resend to ${user.email}` };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Internal server error while resending OTP",
      };
    }
  };
}
