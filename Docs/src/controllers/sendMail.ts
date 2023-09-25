import nodemailer from "nodemailer";
import { generateLink } from "./linkHandler";

type MailPromise = Promise<boolean | Error>;

const sendMail = async (email: string, otp?: number): MailPromise => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER_EMAIL,
      pass: process.env.NODEMAILER_APP_PASSWORD,
    },
  });

  const link = otp ? "" : generateLink(email);

  const emailHtml = otp
    ? `
  <p>OTP for account verification:</p>
  <h2>${otp}</h2>
  <p>Please use this OTP to verify your account.</p>
  <p>The OTP is valid for 5 minutes only.</p>`
    : `
  <p>Link for account verification:</p>
  <a href="${link}">${link?.slice(0, 80)}</a>
  <p>Please click on the link to verify your account.</p>
  <p>The link is valid for 5 minutes only.</p>`;

  const mailDetails = {
    from: process.env.NODEMAILER_USER_EMAIL,
    to: email,
    subject: "Verify Your Account",
    html: `
        <html>
          <body>
            <p>Dear User,</p>
            ${emailHtml}
            <br>
            <hr>
            <br>
            <p><strong>Email Validation System</strong></p>
          </body>
        </html>
      `,
  };

  return new Promise((resolve, reject) => {
    if (!link && !otp) {
      reject("Verification token not found");
    } else {
      mailTransporter.sendMail(mailDetails, (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log(
            `Successfully send ${otp ? "OTP" : "verification link"} to ${
              data.accepted
            }`
          );
          resolve(true);
        }
      });
    }
  });
};

export default sendMail;
