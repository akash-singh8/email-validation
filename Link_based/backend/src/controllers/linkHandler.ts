import jwt from "jsonwebtoken";

export const generateLink = (email: string): string | undefined => {
  try {
    if (!process.env.JWT_OTP_SECRET) {
      throw new Error("JWT_OTP_SECRET environment variable is not defined.");
    }

    if (!process.env.BASE_URL) {
      throw new Error("BASE_URL environment variable is not defined.");
    }

    const link = jwt.sign({ email }, process.env.JWT_OTP_SECRET, {
      expiresIn: "5m",
    });

    return process.env.BASE_URL + link;
  } catch (err) {
    console.log("Error while generating link");
    console.error(err);
  }
};
