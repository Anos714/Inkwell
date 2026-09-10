import { z } from "zod";

const envSchema = z.object({
  PORT: z
    .string()
    .default("8000")
    .transform((val) => parseInt(val, 10)),
  BUN_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.url("DATABASE_URL must be a valid connection string"),

  REDIS_URL: z.url("REDIS_URL must be a valid connection string"),

  ACCESS_TOKEN_SECRET_KEY: z.string(),
  REFRESH_TOKEN_SECRET_KEY: z.string(),

  FRONTEND_URL: z.url("FRONTEND_URL must be a valid URL"),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.url("GOOGLE_REDIRECT_URI must be a valid URL"),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

const parsedEnv = envSchema.safeParse(Bun.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables configuration footprint:");

  const structuredErrors = z.treeifyError(parsedEnv.error);

  console.error(JSON.stringify(structuredErrors, null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
