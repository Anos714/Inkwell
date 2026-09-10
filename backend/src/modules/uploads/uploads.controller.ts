import { Context } from "hono";
import { AppError } from "../../utils/AppError";
import { UploadType, uploadTypes } from "./uploads.type";
import cloudinary from "../../config/cloudinary";
import { env } from "../../config/env";

export const uploadImageController = async (c: Context) => {
  const payload = c.get("user");

  if (!payload) {
    throw AppError.Unauthorized("Unauthorized");
  }

  const type = c.req.query("type");

  if (!type || !Object.hasOwn(uploadTypes, type)) {
    throw AppError.BadRequest("A valid upload type is required");
  }

  const uploadType = type as UploadType;

  if (uploadType === "blogCover" && payload.role !== "admin") {
    throw AppError.Forbidden("Only admins can upload blog covers");
  }

  const { folder } = uploadTypes[uploadType];
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    env.CLOUDINARY_API_SECRET,
  );

  return c.json({
    success: true,
    data: {
      timestamp,
      signature,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
      maxSize: uploadTypes[uploadType].maxSize,
    },
  });
};
