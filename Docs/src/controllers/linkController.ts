import {
  Controller,
  Patch,
  Route,
  SuccessResponse,
  Request,
  Response,
  Security,
} from "tsoa";
import { LinkService } from "../services/linksService";

@Route("link")
export class LinkController extends Controller {
  /**
   * Resend verification link to user's email
   */
  @SuccessResponse("201", "Created")
  @Response("403", "Forbidden")
  @Response("404", "User already verified")
  @Response("500", "Internal server error")
  @Security("jwt")
  @Patch("resend")
  public async resendLink(@Request() request: Request) {
    const requestBody: any = request.body;
    console.log("Request Body :", requestBody);
    const newUser = new LinkService();
    const result = await newUser.resend(requestBody.userID);

    this.setStatus(result.status);
    return result;
  }
}
