CREATE TABLE "comment_likes" (
	"user_id" uuid,
	"comment_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comment_likes_pkey" PRIMARY KEY("user_id","comment_id")
);
--> statement-breakpoint
ALTER TABLE "blog_comments" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD COLUMN "gif_url" text;--> statement-breakpoint
ALTER TABLE "blog_comments" ALTER COLUMN "content" SET DEFAULT '';--> statement-breakpoint
CREATE INDEX "blog_comments_thread_idx" ON "blog_comments" ("blog_id","parent_id","created_at");--> statement-breakpoint
CREATE INDEX "comment_likes_comment_idx" ON "comment_likes" ("comment_id");--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parent_id_blog_comments_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "blog_comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_blog_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "blog_comments"("id") ON DELETE CASCADE;