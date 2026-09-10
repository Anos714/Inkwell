import { Hono } from "hono";
import { uploadImageController } from "./uploads.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const uploadsRoute = new Hono();

uploadsRoute.get("/signature", requireAuth, uploadImageController);

export default uploadsRoute;
