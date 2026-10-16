CREATE INDEX "blog_comments_blog_idx" ON "blog_comments" ("blog_id","created_at");--> statement-breakpoint
CREATE INDEX "blogs_published_idx" ON "blogs" ("is_published","published_at");--> statement-breakpoint
CREATE INDEX "blogs_created_idx" ON "blogs" ("created_at");