import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().trim().email("Provide a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(256),
});

export const SignupSchema = LoginSchema.extend({
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters.")
    .max(32)
    .regex(/^[A-Za-z0-9._-]+$/, "Username may only contain letters, numbers, dot, dash, underscore."),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
