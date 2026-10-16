import { z } from "zod";

export const blogCommentsSchema = z.object({
  content: z
    .string({ error: "Comment content is required" })
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be at most 2000 characters"),
});

export type BlogCommentInput = z.infer<typeof blogCommentsSchema>;
