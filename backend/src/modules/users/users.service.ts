import { TokenPayload } from "google-auth-library";
import { AppError } from "../../utils/AppError";
import {
  createGoogleAuthUser,
  deleteUserProfile,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  findUserByUsername,
  updateGoogleAuthUser,
  updateUserById,
} from "./users.repository";
import { UpdateProfileInput } from "./users.schema";

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
    const hasChanged =
      user.googleId !== data.sub || user.avatarUrl !== data.picture;
    if (hasChanged) {
      user = await updateGoogleAuthUser(user.id, {
        ...data,
        name: user.username,
      });
    }
  }

  return user;
};

export const userProfileDeleteService = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) throw AppError.NotFound("User not found");
  const deletedUser = await deleteUserProfile(userId);

  if (!deletedUser)
    throw AppError.InternalServerError("Failed to delete user profile");

  return deletedUser;
};

export const updateProfileService = async (
  userId: string,
  data: UpdateProfileInput,
) => {
  const user = await findUserById(userId);
  if (!user) throw AppError.NotFound("User not found");
  if (data.username) {
    const username = data.username.toLowerCase();

    if (username !== user.username) {
      const existingUser = await findUserByUsername(username);

      if (existingUser && existingUser.id !== userId) {
        throw new Error("Username already taken");
      }

      data = {
        ...data,
        username,
      };
    }
  }

  const updatedUser = await updateUserById(userId, data);

  if (!updatedUser) throw AppError.InternalServerError("Failed to update user");
  return updatedUser;
};
