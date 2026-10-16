import { z } from "zod";

const gifUrlSchema = z
  .url({ error: "GIF must be a valid URL" })
  .max(500, "GIF URL is too long")
  .refine((url) => url.startsWith("https://"), {
    error: "GIF must be served over https",
  })
  .optional();

export const blogCommentsSchema = z
  .object({
    content: z
      .string({ error: "Comment content is required" })
      .trim()
      .max(2000, "Comment must be at most 2000 characters")
      .optional()
      .default(""),
    parentId: z.uuid({ error: "Parent comment must be a valid ID" }).optional(),
    gifUrl: gifUrlSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.content && !data.gifUrl) {
      ctx.addIssue({
        code: "custom",
        message: "Write something or attach a GIF",
      });
    }
  });

export type BlogCommentInput = z.infer<typeof blogCommentsSchema>;
