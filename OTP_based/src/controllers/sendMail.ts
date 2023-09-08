import nodemailer from "nodemailer";

type MailPromise = Promise<boolean | Error>;

const sendMail = async (email: string, OTP: number): MailPromise => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER_EMAIL,
      pass: process.env.NODEMAILER_APP_PASSWORD,
    },
  });

  const mailDetails = {
    from: process.env.NODEMAILER_USER_EMAIL,
    to: email,
    subject: "OTP Verification for Your Account",
    html: `
        <html>
          <body>
            <p>Dear User,</p>
            <p>Your OTP for account verification is:</p>
            <h2>${OTP}</h2>
            <p>Please use this OTP to verify your account.</p>
            <p>The OTP is valid for 5 minutes only.</p>
            <br>
            <hr>
            <br>
            <p><strong>Email Validation System</strong></p>
          </body>
        </html>
      `,
  };

  return new Promise((resolve, reject) => {
    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Successfully send OTP to ${data.accepted}`);
        resolve(true);
      }
    });
  });
};

export default sendMail;
