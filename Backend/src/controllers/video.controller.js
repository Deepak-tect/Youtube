import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const publishVideo = asyncHandler(async(req,res)=>{
    const user = req.user;
    const videoLocalPath = req.files.videoFile[0].path;
    const thumbnailLocalPath = req.files.thumbnail[0].path;
    const {title , description} = req.body;
    
    const videoUrl = await uploadOnCloudinary(videoLocalPath);
    if(!videoUrl){
        throw new ApiError(501 , "failed to upload on video")
    }
    const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnailUrl){
        throw new ApiError(501 , "failed to upload on thumbnail")
    }
    await Video.create({
        videoFile: videoUrl.url,
        thumbnail:thumbnailUrl.url,
        title,
        description,
        duration: videoUrl.duration,
        owner:user
    })
    
    res.status(200).json(new ApiResponse(200 , {}, "video uploaded successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.query
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(500 , "failed to get video");
    }
    res.status(200).json(new ApiResponse(200 , video , "video successfully fetched"));
    
})

//TODO: update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.query
    const {title, description} = req.body;
    const thumbnail = req.file.path
    const user = req.user
    if(!user){
        throw new ApiError(200 ,"Person is not logged in , please login")
    }
    const video = await Video.findById(videoId);
    const userId = new mongoose.Types.ObjectId(user._id)
    const ownerId = new mongoose.Types.ObjectId(video.owner);
    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(200 ,"unauthorized person tring to update the video")
    }
    const thumbnailPath = await uploadOnCloudinary(thumbnail);
    
    if(!thumbnailPath){
        throw new ApiError(200 ,"failed to upload on cloud")
    }
    video.description = description;
    video.title = title;
    video.thumbnail = thumbnailPath.url;
    await video.save();
    res.status(200).json(new ApiResponse(200 , {} , "video updated successfully"));
    

})

//TODO: delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.query
    const user = req.user
    if(!user){
        throw new ApiError(200 ,"Person is not logged in , please login")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(200 ,"video not found")
    }
    const userId = new mongoose.Types.ObjectId(user._id)
    const ownerId = new mongoose.Types.ObjectId(video.owner);
    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(200 ,"unauthorized person tring to update the video")
    }
    await Video.deleteOne({_id: videoId});
    res.status(200).json(new ApiResponse(200 , {} , "video deleted successfully"))
    
})

//TODO: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page=1, limit=3 ,title} = req.query
    const user = req.user;
    // console.table([page , limit]);
    const skip = (page-1)*limit;
    const video = await Video.find({title:title}).skip(skip).limit(limit).sort({ views:"desc",createdAt: 'desc' });
    if(!video){
        throw new ApiError(500 , "failed to fetched data from database");
    }
    res.status(200).json(new ApiResponse(200 , video , "successfully fetched data"));
    
})


export {publishVideo, getVideoById,updateVideo,deleteVideo, getAllVideos}