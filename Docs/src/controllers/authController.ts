import {
  Body,
  Controller,
  Example,
  Post,
  Route,
  SuccessResponse,
  Response,
} from "tsoa";
import {
  UsersService,
  UserCreationParams,
  UserCheckParams,
} from "../services/usersService";

@Route("auth")
export class AuthController extends Controller {
  /**
   * Create a new account for the user..
   */
  @SuccessResponse("201", "Created")
  @Response("404", "Invalid Input")
  @Response("409", "Conflict")
  @Response("500", "Internal server error")
  @Post("signup")
  public async createUser(@Body() requestBody: UserCreationParams) {
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
  @Response("404", "Not Found or Invalid Input")
  @Response("500", "Internal Server Error")
  @Post("login")
  public async checkUser(@Body() requestBody: UserCheckParams) {
    const newUser = new UsersService();
    const result = await newUser.check(requestBody);

    this.setStatus(result.status);
    return result;
  }
}
