import { Context, Env } from "hono";
import { BlogCommentInput, CommentsQueryInput } from "./blog-comments.schema";

export type BlogCommentContext = Context<
  Env,
  string,
  {
    in: { json: BlogCommentInput };
    out: { json: BlogCommentInput };
  }
>;

export type BlogCommentsQueryContext = Context<
  Env,
  string,
  {
    in: { query: CommentsQueryInput };
    out: { query: CommentsQueryInput };
  }
>;
