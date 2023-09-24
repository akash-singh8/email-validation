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
        jwt.verify(token, process.env.JWT_AUTH_SECRET!, (err, decode) => {
          if (err) {
            reject(err);
          } else {
            if (decode && typeof decode !== "string")
              request.body.userID = decode?.id;
            resolve(decode);
          }
        });
      }
    });
  }

  return new Promise((resolve, reject) => {
    reject("Authorization not defined");
  });
}
