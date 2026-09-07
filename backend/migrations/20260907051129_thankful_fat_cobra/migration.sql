ALTER TABLE "users" ALTER COLUMN "avatar_url" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_url" DROP NOT NULL;