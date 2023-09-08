import { z } from "zod";
import { signupInputSchema } from "../validation/authValidation";

export type SignupUserData = z.infer<typeof signupInputSchema>;
