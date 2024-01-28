import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import {Video} from '../models/video.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const addComment = asyncHandler(async (req, res) => {
    const user = req.user
    const {content , videoId} = req.query;
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(501, "failed to find video")
    const comment = await Comment.create({
        content,
        video,
        owner : user
    })
    if(!comment) throw new ApiError(501, "failed to added comment")

    res.status(200).json(new ApiResponse(200 , {} , "comment added successfully"));
    
})

const updateComment = asyncHandler(async (req, res) => {
    
    const {content , video} = req.query;
    const owner = req.user._id;
    
    let comment = await Comment.findOne({owner, video});
    if(!comment) throw new ApiError(500 , "failed to find comment");
    comment.content = content;
    await comment.save();
    res.status(200).json(new ApiResponse(200 , {} , "successfully updated"));
    
})

const deleteComment = asyncHandler(async (req, res) => {
    const owner = req.user._id;
    const {video} = req.query;
    const comment = await Comment.findOneAndDelete({owner , video});
    if(!comment) throw new ApiError(500 , "failed to delete comment");
    res.status(200).json(new ApiResponse(200 , {} , "successfully deleted the comment"))

})

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.query
    const {page = 1, limit = 3} = req.query
    
    const skip = (page-1)*limit;
    const comments = await Comment.find({video : videoId}).skip(skip).limit(limit);
    if(!comments){
        throw new ApiError(500, "failed to find video");
    }
    res.status(200).json(new ApiResponse(200 , comments, "successfully fetched the data"));
    
})

export {addComment, updateComment, deleteComment,getVideoComments};