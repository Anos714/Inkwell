import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { resolveGifController, uploadImageController } from "./uploads.controller";
import { gifResolveSchema } from "./gif-resolve.schema";
import { requireAuth } from "../../middleware/auth.middleware";

const uploadsRoute = new Hono();

uploadsRoute.get(
  "/signature",
  requireAuth,
  zValidator(
    "query",
    z.object({
      type: z.enum(["blogCover", "avatar"], { error: "A valid upload type is required" }),
    }),
    (result, _) => {
      if (!result.success) throw result.error;
    },
  ),
  uploadImageController,
);

uploadsRoute.post(
  "/gif-resolve",
  requireAuth,
  zValidator("json", gifResolveSchema, (result, _) => {
    if (!result.success) throw result.error;
  }),
  resolveGifController,
);

export default uploadsRoute;
