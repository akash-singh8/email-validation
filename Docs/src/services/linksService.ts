import User from "../models/Users";
import sendMail from "../controllers/sendMail";

export class LinkService {
  public resend = async (userID: string) => {
    try {
      if (!userID) throw new Error("User id not found");

      const user = await User.findById(userID);

      if (!user || user.banned) {
        return {
          status: 403,
          message: `The user account is ${user ? "banned" : "deleted"}.`,
        };
      }

      if (user.linkGenerated >= 7) {
        await User.updateOne({ _id: user._id }, { banned: true });

        return {
          status: 403,
          message: "Too many attempts, the account is Banned!",
        };
      }

      if (user.verified) {
        return { status: 404, message: `${user.email} is already verified` };
      }

      await User.updateOne({ _id: user._id }, { $inc: { linkGenerated: 1 } });
      await sendMail(user.email);

      return { status: 201, message: `Link resend to ${user.email}` };
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
