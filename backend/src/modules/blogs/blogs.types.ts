import { Context, Env } from "hono";
import {
  CreateBlogInput,
  GetBlogsQueryInput,
  PatchBlogInput,
} from "./blogs.schema";

// contexts
export type CreateBlogContext = Context<
  Env,
  string,
  {
    in: { json: CreateBlogInput };
    out: { json: CreateBlogInput };
  }
>;

export type PatchBlogContext = Context<
  Env,
  string,
  {
    in: { json: PatchBlogInput };
    out: { json: PatchBlogInput };
  }
>;

export type GetBlogsContext = Context<
  Env,
  string,
  {
    in: { query: GetBlogsQueryInput };
    out: { query: GetBlogsQueryInput };
  }
>;

// req & res types

type Blog = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: unknown;
  coverImage: string | null;
  tags: string[] | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SuccessBlogResponse {
  success: true;
  message: string;
  data?: Blog;
}

export interface PaginatedBlogsResponse {
  success: true;
  message: string;
  data: Blog[];
  pagination: PaginationMeta;
}
