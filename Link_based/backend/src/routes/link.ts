import express from "express";
import { authenticateJWT } from "../middlewares/authJWT";
import { resendLink, verifyLink } from "../controllers/linkHandler";
import authenticateLinkToken from "../middlewares/authLink";

const linkRouter = express.Router();

linkRouter.patch("/resend", authenticateJWT, resendLink);

linkRouter.patch("/verify", authenticateLinkToken, verifyLink);

export default linkRouter;
