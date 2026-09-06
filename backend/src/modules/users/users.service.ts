import { TokenPayload } from "google-auth-library";
import { AppError } from "../../utils/AppError";
import {
  createGoogleAuthUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  updateGoogleAuthUser,
} from "./users.repository";

export const getUserByIdService = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) throw AppError.NotFound("User not found");
  return user;
};

export const googleAuthService = async (data: TokenPayload) => {
  const { email } = data;
  if (!email) throw AppError.BadRequest("Email not provided");
  let user = await findUserByEmail(email);
  if (!user && data.sub) {
    user = await findUserByGoogleId(data.sub);
  }

  if (!user) {
    user = await createGoogleAuthUser(data);
  } else if (user) {
    const hasChanged = user.googleId !== data.sub || user.avatarUrl !== data.picture;
    if (hasChanged) {
      user = await updateGoogleAuthUser(user.id, {
        ...data,
        name: user.username,
      });
    }
  }

  return user;
};
