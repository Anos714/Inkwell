import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as UserController from "./users.controller";
import { googleOAuthSchema } from "./users.schema";
import { requireAuth } from "../../middleware/auth.middleware";

const userRoutes = new Hono();

userRoutes.post("/refresh", UserController.refreshTokenController);
userRoutes.get("/me", requireAuth, UserController.getMeController);
userRoutes.post("/logout", requireAuth, UserController.logoutUserController);

userRoutes.post(
  "/auth/google",
  zValidator("json", googleOAuthSchema, (result, _) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  UserController.googleAuthController,
);

export default userRoutes;
