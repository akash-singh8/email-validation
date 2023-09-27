import {
  Body,
  Controller,
  Patch,
  Route,
  SuccessResponse,
  Request,
  Response,
  Middlewares,
  Security,
} from "tsoa";
import { OTPService } from "../services/otpService";
import { validationCheck } from "../middlewares/validate";
import { Request as expressReq } from "express";

type OTPSignupParams = { otp: string };

@Route("otp")
export class OTPController extends Controller {
  /**
   * Resend verification OTP to user's email
   */
  @SuccessResponse("201", "Created")
  @Response("403", "Forbidden")
  @Response("409", "User already verified")
  @Response("500", "Internal server error")
  @Security("jwt")
  @Patch("resend")
  @Middlewares(validationCheck)
  public async resendOTP(@Request() request: expressReq) {
    const requestBody = request.body;
    const newOTP = new OTPService();
    const result = await newOTP.resend(requestBody.user);

    this.setStatus(result.status);
    return result;
  }
}
