export const uploadTypes = {
  blogCover: {
    folder: "blog-covers",
    maxSize: 5 * 1024 * 1024, // 5 MB
  },

  avatar: {
    folder: "user-avatars",
    maxSize: 2 * 1024 * 1024, // 2 MB
  },
} as const;

export type UploadType = keyof typeof uploadTypes;
