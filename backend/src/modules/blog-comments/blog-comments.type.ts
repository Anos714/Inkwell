import { Context, Env } from "hono";
import { BlogCommentInput } from "./blog-comments.schema";

export type BlogCommentContext = Context<
  Env,
  string,
  {
    in: { json: BlogCommentInput };
    out: { json: BlogCommentInput };
  }
>;
