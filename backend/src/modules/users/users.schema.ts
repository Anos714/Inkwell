import { z } from "zod";

export const googleOAuthSchema = z
  .object({
    code: z.string({ error: "google auth code is required" }).trim(),
  })
  .strict();

export type GoogleOAuthInput = z.infer<typeof googleOAuthSchema>;
