import { Request } from "express";
import jwt from "jsonwebtoken";

function authenticate(
  request: Request,
  secret: string,
  token?: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error("No token provided"));
    } else {
      jwt.verify(token, secret, async (err, user) => {
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

export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes: string[] | undefined
): Promise<any> {
  if (securityName === "jwt") {
    const token = request.headers["authorization"]?.split(" ")[1];

    return authenticate(request, process.env.JWT_AUTH_SECRET!, token);
  }

  if (securityName === "link") {
    const userToken = request.headers["usertoken"] as string;

    return authenticate(request, process.env.JWT_LINK_SECRET!, userToken);
  }

  return new Promise((resolve, reject) => {
    reject("Authorization not defined");
  });
}
