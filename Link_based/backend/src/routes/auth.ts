import express from "express";
import { handleLogin, signupHandler } from "../controllers/authHandler";

const authRouter = express.Router();

authRouter.post("/signup", signupHandler);

authRouter.post("/login", handleLogin);

export default authRouter;
