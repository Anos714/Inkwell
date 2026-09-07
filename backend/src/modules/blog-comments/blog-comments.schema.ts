import { z } from "zod";

export const blogCommentsSchema = z.object({
  content: z.string({ error: "Comment content is required" }),
});

export type BlogCommentInput = z.infer<typeof blogCommentsSchema>;
