import express from "express";
import { handleSignup, handleLogin } from "../controllers/auth";

const authRouter = express.Router();

authRouter.post("/signup", handleSignup);

authRouter.post("/login", handleLogin);

export default authRouter;
