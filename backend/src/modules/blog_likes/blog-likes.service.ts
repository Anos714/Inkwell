import * as blogLikesRepository from "./blog-likes.repository";

export const toggleBlogLikeService = async (blogId: string, userId: string) => {
  const existingLike = await blogLikesRepository.checkExistingLike(
    blogId,
    userId,
  );

  if (existingLike) {
    await blogLikesRepository.deleteLike(blogId, userId);
    return {
      liked: false,
      message: "Blog unliked successfully",
      totalLikes: await blogLikesRepository.countLikes(blogId),
      statusCode: 200,
    };
  } else {
    await blogLikesRepository.createLike(blogId, userId);
    return {
      liked: true,
      message: "Blog liked successfully",
      totalLikes: await blogLikesRepository.countLikes(blogId),
      statusCode: 201,
    };
  }
};

export const currentUserLikeStatusService = async (
  userId: string,
  blogId: string,
) => {
  const existingLike = await blogLikesRepository.checkExistingLike(
    blogId,
    userId,
  );

  const totalLikes = await blogLikesRepository.countLikes(blogId);

  return {
    liked: !!existingLike,
    message: "Blog liked status retrieved successfully",
    totalLikes,
    statusCode: 200,
  };
};
