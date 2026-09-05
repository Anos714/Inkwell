import { OAuth2Client } from "google-auth-library";
import { env } from "./env";

export const googleClient = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri:env.GOOGLE_REDIRECT_URI
});
