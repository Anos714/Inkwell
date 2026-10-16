import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { uploadImageController } from "./uploads.controller";
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

export default uploadsRoute;
