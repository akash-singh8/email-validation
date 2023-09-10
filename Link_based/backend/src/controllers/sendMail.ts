import nodemailer from "nodemailer";
import { generateLink } from "./linkHandler";

type MailPromise = Promise<boolean | Error>;

const sendMail = async (email: string): MailPromise => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER_EMAIL,
      pass: process.env.NODEMAILER_APP_PASSWORD,
    },
  });

  const link = generateLink(email);

  const mailDetails = {
    from: process.env.NODEMAILER_USER_EMAIL,
    to: email,
    subject: "Verify Your Account",
    html: `
        <html>
          <body>
            <p>Dear User,</p>
            <p>Link for account verification:</p>
            <a href="${link}">${link}</a>
            <p>Please click on the link to verify your account.</p>
            <p>The link is valid for 5 minutes only.</p>
            <br>
            <hr>
            <br>
            <p><strong>Email Validation System</strong></p>
          </body>
        </html>
      `,
  };

  return new Promise((resolve, reject) => {
    if (!link) {
      reject("Verification link not found");
    }
    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Successfully send verification link to ${data.accepted}`);
        resolve(true);
      }
    });
  });
};

export default sendMail;
