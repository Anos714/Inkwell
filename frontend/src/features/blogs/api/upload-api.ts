import { z } from "zod";
import { apiRequest } from "../../../lib/api";

const signatureResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    timestamp: z.number(),
    signature: z.string(),
    apiKey: z.string(),
    cloudName: z.string(),
    folder: z.string(),
    maxSize: z.number().positive(),
  }),
});

const cloudinaryResponseSchema = z.object({
  secure_url: z.string(),
  public_id: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
  bytes: z.number(),
});

type UploadType = "blogCover" | "avatar";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function uploadImage(token: string, file: File, type: UploadType) {
  // 1. Get signed upload data from our backend
  const signatureResponse = await apiRequest(
    `/api/v1/uploads/signature?type=${type}`,
    signatureResponseSchema,
    {
      headers: authHeaders(token),
    },
  );

  const { timestamp, signature, apiKey, cloudName, folder, maxSize } =
    signatureResponse.data;

  if (file.size > maxSize) {
    throw new Error(`Image must be smaller than ${maxSize / 1024 / 1024}MB.`);
  }

  // 2. Upload directly to Cloudinary
  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.error?.message || "Cloudinary upload failed");
  }

  const result = cloudinaryResponseSchema.parse(await response.json());

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function saveAvatar(token: string, avatarUrl: string) {
  return apiRequest(
    "/api/v1/users/me/avatar",
    z.object({
      success: z.boolean(),
      message: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        username: z.string(),
        avatarUrl: z.string().nullable().optional(),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
    }),
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ avatarUrl }),
    },
  );
}
