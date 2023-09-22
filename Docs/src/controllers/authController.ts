import { Body, Controller, Post, Route, SuccessResponse } from "tsoa";
import {
  UsersService,
  UserCreationParams,
  UserCheckParams,
} from "../services/usersService";

@Route("auth")
export class AuthController extends Controller {
  @SuccessResponse("201", "Created")
  @Post("signup")
  public async createUser(@Body() requestBody: UserCreationParams) {
    const newUser = new UsersService();
    const result = await newUser.create(requestBody);

    this.setStatus(result.status);
    return result;
  }

  @SuccessResponse("200", "Success")
  @Post("login")
  public async checkUser(@Body() requestBody: UserCheckParams) {
    const newUser = new UsersService();
    const result = await newUser.check(requestBody);

    this.setStatus(result.status);
    return result;
  }
}
