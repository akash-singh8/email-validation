import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserInterface } from "../interfaces/userInterface";
import sendMail from "../controllers/sendMail";
import User from "../models/Users";

export type UserCreationParams = Pick<
  UserInterface,
  "name" | "email" | "password"
>;

export type UserCheckParams = Pick<UserInterface, "email" | "password">;

export class UsersService {
  public create = async (userCreationParams: UserCreationParams) => {
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
        linkGenerated: 1,
      });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_AUTH_SECRET, {
        expiresIn: "1h",
      });
      return { status: 201, message: "Signed successfully", authToken: token };
    } catch (err) {
      console.log(err);
      return { status: 500, message: "Internal server error during signup" };
    }
  };

  public check = async (userCheckParams: UserCheckParams) => {
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

      const token = jwt.sign({ id: user._id }, process.env.JWT_AUTH_SECRET, {
        expiresIn: "1h",
      });

      return { status: 200, message: "Logged successfully", authToken: token };
    } catch (err) {
      console.log(err);
      return { status: 500, message: "Internal server error during login" };
    }
  };
}
