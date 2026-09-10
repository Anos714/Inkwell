import { z } from "zod";

export const googleOAuthSchema = z
  .object({
    code: z.string({ error: "google auth code is required" }).trim(),
  })
  .strict();

export const updateUserProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ),
  })
  .strict();

export type GoogleOAuthInput = z.infer<typeof googleOAuthSchema>;
export type UpdateProfileInput = z.infer<typeof updateUserProfileSchema>;
