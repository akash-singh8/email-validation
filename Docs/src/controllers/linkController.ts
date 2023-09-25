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
    const newLink = new LinkService();
    const result = await newLink.resend(requestBody.userID);

    this.setStatus(result.status);
    return result;
  }

  /**
   * Verifies the token attached with the verification link
   */
  @SuccessResponse("200", "Success")
  @Response("500", "Internal Server Error")
  @Security("link")
  @Patch("verify")
  public async checkUser(@Request() request: Request) {
    const requestBody: any = request.body;
    const link = new LinkService();
    const result = await link.verify(requestBody.email);

    this.setStatus(result.status);
    return result;
  }
}
