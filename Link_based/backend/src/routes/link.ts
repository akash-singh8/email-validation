import express from "express";
import { authenticateJWT } from "../middlewares/authJWT";
import { resendLink, verifyLink } from "../controllers/linkHandler";

const linkRouter = express.Router();

linkRouter.patch("/resend", authenticateJWT, resendLink);

linkRouter.patch("/verify", verifyLink);

export default linkRouter;
