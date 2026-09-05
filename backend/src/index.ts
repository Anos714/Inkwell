import { Hono } from "hono";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { corsConfig } from "./config/cors";
import { cors } from "hono/cors";
import userRoutes from "./modules/users/users.route";

const app = new Hono();

// cors
app.use("*", cors(corsConfig));

// global error handler middleware
app.onError(errorHandler);

// routes
app.get("/ping", (c) => {
  return c.json({ success: true, message: "pong" });
});
app.route("/api/v1/users", userRoutes);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
