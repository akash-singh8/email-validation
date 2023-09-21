import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserInterface } from "../interfaces/userInterface";
import sendMail from "../controllers/sendMail";
import User from "../models/Users";

export type UserCreationParams = Pick<
  UserInterface,
  "name" | "email" | "password"
>;

export class UsersService {
  public create = async (userCreationParams: UserCreationParams) => {
    const { name, email, password } = userCreationParams;

    try {
      const user = await User.findOne({ email });

      if (user) {
        return { message: "Email address is already in use." };
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
      return { message: "Signed successfully", authToken: token };
    } catch (err) {
      console.log(err);
      return { message: "Internal server error during signup" };
    }
  };
}
