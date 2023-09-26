import { Request } from "express";
import jwt from "jsonwebtoken";

export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes: string[] | undefined
): Promise<any> {
  if (securityName === "jwt") {
    const token = request.headers["authorization"]?.split(" ")[1];

    return new Promise((resolve, reject) => {
      if (!token) {
        reject(new Error("No token provided"));
      } else {
        jwt.verify(token, process.env.JWT_AUTH_SECRET!, async (err, user) => {
          if (err) {
            reject(err);
          } else {
            if (user && typeof user !== "string") {
              if (user.banned) {
                return reject(new Error("The user account is Banned!"));
              }

              request.body.user = {
                id: user.id,
                email: user.email,
                attempts: user.totalAttempts,
                verified: user.verified,
              };

              resolve(user);
            }
          }
        });
      }
    });
  }

  if (securityName === "link") {
    const userToken = request.headers["usertoken"] as string;

    return new Promise((resolve, reject) => {
      if (!userToken) {
        reject(new Error("User verification token not found"));
      } else {
        jwt.verify(userToken, process.env.JWT_LINK_SECRET!, (err, data) => {
          if (err) {
            reject(new Error("Link expired, resend new Link!"));
          } else if (data && typeof data !== "string") {
            request.body.email = data.email;
            resolve(data);
          }
        });
      }
    });
  }

  return new Promise((resolve, reject) => {
    reject("Authorization not defined");
  });
}
