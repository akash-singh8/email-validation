import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../controllers/sendMail";
import User from "../models/Users";

export type UserSignupParams = {
  name: string;
  email: string;
  password: string;
};

export type UserLoginParams = {
  email: string;
  password: string;
};

export class UsersService {
  public create = async (userCreationParams: UserSignupParams) => {
    const { name, email, password } = userCreationParams;

    try {
      const user = await User.findOne({ email });

      if (user) {
        return { status: 409, message: "Email address is already in use." };
      }

      if (!process.env.JWT_AUTH_SECRET) {
        throw new Error("JWT_AUTH_SECRET environment variable is not defined.");
      }

      await sendMail(email);

      const encrypted_Pswd = await bcrypt.hash(password, 11);

      const newUser = new User({
        name,
        email,
        password: encrypted_Pswd,
        totalAttempts: 1,
      });
      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, verified: false, banned: false, totalAttempts: 1 },
        process.env.JWT_AUTH_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return { status: 201, message: "Signed successfully", authToken: token };
    } catch (err) {
      console.log(err);
      return { status: 500, message: "Internal server error during signup" };
    }
  };

  public check = async (userCheckParams: UserLoginParams) => {
    const { email, password } = userCheckParams;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return {
          status: 404,
          message: `The user with the email ${email} does not exist.`,
        };
      }

      if (user.banned) {
        return { status: 403, message: `User ${email} is banned.` };
      }

      const isValidPswd = await bcrypt.compare(password, user.password);

      if (!isValidPswd) {
        return { status: 403, message: "Invalid password" };
      }

      if (!process.env.JWT_AUTH_SECRET) {
        throw new Error("JWT_AUTH_SECRET environment variable is not defined.");
      }

      const token = jwt.sign(
        {
          id: user._id,
          verified: user.verified,
          banned: user.banned,
          totalAttempts: user.totalAttempts,
        },
        process.env.JWT_AUTH_SECRET,
        {
          expiresIn: "1h",
        }
      );

      return { status: 200, message: "Logged successfully", authToken: token };
    } catch (err) {
      console.log(err);
      return { status: 500, message: "Internal server error during login" };
    }
  };
}
