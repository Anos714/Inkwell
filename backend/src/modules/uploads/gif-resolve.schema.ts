import { z } from "zod";

export const gifResolveSchema = z.object({
  url: z
    .url({ error: "A valid GIF link is required" })
    .max(500, "GIF link is too long")
    .refine((url) => url.startsWith("https://"), {
      error: "GIF link must be served over https",
    }),
});

export type GifResolveInput = z.infer<typeof gifResolveSchema>;
