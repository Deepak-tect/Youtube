import mongoose from "mongoose";
import { Subsciption } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.query;

  //**********************one way to get answer ************************/
  // const channel = await Subsciption.find({channel : channelId}).populate('subscriber', 'username email') // You can specify the fields you want to populate
  // .exec();
  // read about poplate()

  // **********************second way using aggregation pipeline******************************
  const subscribers = await Subsciption.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $project: {
        _id: 0,
        subscriberDetails: { $arrayElemAt: ["$subscriberDetails", 0] },
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, subscribers, "success"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.query;
  const subscribedTo = await Subsciption.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedToDetails",
      },
    },
    {
      $project: {
        _id: 0,
        subscribedToDetails: { $arrayElemAt: ["$subscribedToDetails", 0] },
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, subscribedTo, "success"));
});


// controller to subscribe and unsubscribe
// TODO: toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.query;
  const userId = req.user._id;

  const existingSubscription = await Subsciption.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subsciption.deleteOne({
      subscriber: userId,
      channel: channelId,
    });

    res
      .status(200)
      .json(new ApiResponse(200 , {} , "unsubscribed successfully"));
  } else {
    const newSubscription = new Subsciption({
      subscriber: userId,
      channel: channelId,
    });

    await newSubscription.save();

    res.status(200).json(new ApiResponse(200 , {} , "Subscribed successfully"));
    
  }
});



export { getUserChannelSubscribers, getSubscribedChannels, toggleSubscription };
