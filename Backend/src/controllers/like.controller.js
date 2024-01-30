import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.query;
  const user = req.user;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "your video id is wrong");
  }
  if (!user) {
    throw new ApiError(400, "please login first");
  }
  const like = await Like.findOne({ video: videoId, likedBy: user._id });
  if (!like) {
    await Like.create({
      video: videoId,
      likedBy: user,
    });
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully like the video"));
  } else {
    await Like.findByIdAndDelete(like._id);
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Succesfully dislike the video"));
  }
  //TODO: toggle like on video
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.query;
  const user = req.user;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "your comment id is wrong");
  }
  if (!user) {
    throw new ApiError(400, "please login first");
  }
  const like = await Like.findOne({ comment: commentId, likedBy: user._id });
  if (!like) {
    await Like.create({
      comment: commentId,
      likedBy: user,
    });
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully like the comment"));
  } else {
    await Like.findByIdAndDelete(like._id);
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Succesfully dislike the comment"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.query;
  const user = req.user;
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "your tweet id is wrong");
  }
  if (!user) {
    throw new ApiError(400, "please login first");
  }
  const like = await Like.findOne({ tweet: tweetId, likedBy: user._id });
  if (!like) {
    await Like.create({
      tweet: tweetId,
      likedBy: user,
    });
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully like the tweet"));
  } else {
    await Like.findByIdAndDelete(like._id);
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Succesfully dislike the tweet"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos of user

  const likedVideos = await Like.aggregate([
    {
      $set: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "video",
        as: "videos",

        pipeline: [
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "owner",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
        ],
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        videos: {
          "videoFile.url": 1,
          "thumbnail.url": 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,

          ownerDetails: {
            username: 1,
            fullName: 1,
            "avatar?.url": 1,
          },
        },
      },
    },
  ]);

  if (!likedVideos) {
    throw new ApiError(500, "Failed to fetch Liked Videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, likedVideos, "Liked videos fetched Successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
