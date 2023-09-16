import { Router } from "express";
import getEmail from "../controllers/getEmail";
import authenticateLinkToken from "../middlewares/authLink";

const userRouter = Router();

userRouter.post("/email", authenticateLinkToken, getEmail);

export default userRouter;
