import { z } from "zod";

export const createBlogSchema = z
  .object({
    title: z
      .string({ error: "Blog title is required" })
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must be at most 255 characters"),
    slug: z
      .string({ error: "Slug is required" })
      .min(3, "Slug must be at least 3 characters")
      .max(255, "Slug must be at most 255 characters"),
    description: z
      .string({ error: "Description is required" })
      .min(3, "Description must be at least 3 characters")
      .max(255, "Description must be at most 255 characters")
      .optional(),
    content: z.unknown(),
    coverImage: z.url({ error: "Cover image must be a valid URL" }).optional(),
    tags: z
      .array(z.string(), { error: "Tags must be an array of strings" })
      .transform((val) => {
        const cleanedTags = val.map((tag) => tag.toLowerCase().trim());
        return [...new Set(cleanedTags)];
      })
      .optional(),
    isPublished: z
      .boolean({ error: "Is published must be a boolean" })
      .default(false),
  })
  .strict();

export const patchBlogSchema = z
  .object({
    title: z
      .string({ error: "Blog title is required" })
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must be at most 255 characters")
      .optional(),
    slug: z
      .string({ error: "Slug is required" })
      .min(3, "Slug must be at least 3 characters")
      .max(255, "Slug must be at most 255 characters")
      .optional(),
    description: z
      .string({ error: "Description is required" })
      .min(3, "Description must be at least 3 characters")
      .max(255, "Description must be at most 255 characters")
      .optional(),
    content: z.unknown().optional(),
    coverImage: z.url({ error: "Cover image must be a valid URL" }).optional(),
    tags: z
      .array(z.string(), { error: "Tags must be an array of strings" })
      .transform((val) => {
        const cleanedTags = val.map((tag) => tag.toLowerCase().trim());
        return [...new Set(cleanedTags)];
      })
      .optional(),
    isPublished: z
      .boolean({ error: "Is published must be a boolean" })
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const hasAtLeastOneField = Object.keys(data).length > 0;

    if (!hasAtLeastOneField) {
      ctx.addIssue({
        code: "custom",
        message: "Atleast one field is required",
      });
    }
  });

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type PatchBlogInput = z.infer<typeof patchBlogSchema>;
