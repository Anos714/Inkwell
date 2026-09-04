CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"username" varchar(100) NOT NULL UNIQUE,
	"email" varchar(255) NOT NULL UNIQUE,
	"avatar_url" text DEFAULT '' NOT NULL,
	"google_id" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
