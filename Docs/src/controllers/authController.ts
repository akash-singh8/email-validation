import { Body, Controller, Post, Route, SuccessResponse, Response } from "tsoa";
import { UsersService } from "../services/usersService";
import {
  signupInputSchema,
  loginInputSchema,
} from "../validation/authValidation";
import { UserSignupParams, UserLoginParams } from "../services/usersService";
@Route("auth")
export class AuthController extends Controller {
  /**
   * Create a new account for the user..
   */
  @SuccessResponse("201", "Created")
  @Response("400", "Invalid Input")
  @Response("409", "Conflict")
  @Response("500", "Internal server error")
  @Post("signup")
  public async createUser(@Body() requestBody: UserSignupParams) {
    const isValidData = signupInputSchema.safeParse(requestBody);

    if (!isValidData.success) {
      this.setStatus(400);
      return { message: isValidData.error.issues[0].message };
    }

    const newUser = new UsersService();
    const result = await newUser.create(requestBody);

    this.setStatus(result.status);
    return result;
  }

  /**
   * Logs in with the details of an existing user.
   */
  @SuccessResponse("200", "Success")
  @Response("403", "Forbidden")
  @Response("400", "Invalid Input")
  @Response("404", "Not Found")
  @Response("500", "Internal Server Error")
  @Post("login")
  public async checkUser(@Body() requestBody: UserLoginParams) {
    const isValidData = loginInputSchema.safeParse(requestBody);

    if (!isValidData.success) {
      this.setStatus(400);
      return { message: isValidData.error.issues[0].message };
    }

    const newUser = new UsersService();
    const result = await newUser.check(requestBody);

    this.setStatus(result.status);
    return result;
  }
}
