import { z } from "zod";

export const otpInputSchema = z.object({
  OTP: z
    .string()
    .min(6, "Invalid OTP. It should be atleast 6-digit.")
    .max(6, "Invalid OTP. It should be atmost 6-digit."),
});
