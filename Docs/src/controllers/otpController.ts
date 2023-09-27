import {
  Query,
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
import { otpInputSchema } from "../validation/otpValidation";
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

  /**
   * Verifies the OTP that you received on your email
   */
  @SuccessResponse("200", "Success")
  @Response("500", "Internal Server Error")
  @Security("jwt")
  @Patch("verify")
  @Middlewares(validationCheck)
  public async verifyOTP(@Query() OTP: string, @Request() req: expressReq) {
    const isValidOTP = otpInputSchema.safeParse({ OTP });

    if (!isValidOTP.success) {
      return {
        status: 403,
        message: isValidOTP.error.issues[0].message,
      };
    }

    const userData = req.body.user;

    const otp = new OTPService();
    const result = await otp.verify(userData, OTP);

    this.setStatus(200);
    return { result };
  }
}
