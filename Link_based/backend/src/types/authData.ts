import { z } from "zod";
import {
  signupInputSchema,
  loginInputSchema,
} from "../validation/authValidation";

export type SignupUserData = z.infer<typeof signupInputSchema>;

export type LoginUserData = z.infer<typeof loginInputSchema>;
