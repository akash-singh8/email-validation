import { Body, Controller, Post, Route, SuccessResponse } from "tsoa";
import { UsersService, UserCreationParams } from "../services/usersService";

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
}
