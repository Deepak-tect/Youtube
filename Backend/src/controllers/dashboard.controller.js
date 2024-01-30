import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subsciption } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const  userId  = req.user._id;

  // Fetch total subscribers
  const totalSubscribers = await Subsciption.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        subscriberCount: { $sum: 1 },
      },
    },
  ]);

  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    // Calculate total likes
    {
      $addFields: {
        totalLikes: { $size: "$likes" },
      },
    },
  ]);

  // Extract stats
  const channelStats = {
    totalSubscribers: totalSubscribers[0]?.subscriberCount || 0,
    totalLikes: videoStats[0]?.totalLikes || 0,
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
  };

  if (!channelStats.totalVideos) {
    throw new ApiError(404, "Channel not found or no videos available");
  }

  res.status(200).json(
    new ApiResponse(200, channelStats, "Channel stats fetched successfully")
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  let {userId} = req.body;
  
  if(!userId){
    userId = req.user._id;
  }
  if(!userId){
    throw new ApiError(400 , "please login first");
  }
  const video = await Video.find({owner:userId});
  res.status(200).json(new ApiResponse(200 , video , "successfully fetched video of channel"))

});

export { getChannelStats, getChannelVideos };
