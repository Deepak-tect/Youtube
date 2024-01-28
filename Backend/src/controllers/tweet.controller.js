import { asyncHandler } from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user = req.user;
    const {content} = req.body;
    if(!content){
        throw new ApiError(400 , "Please send content");
    }
    await Tweet.create({
        content,
        owner : user
    })
    res.status(200).json(new ApiResponse(200 , {} , "Tweet successfully added "))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user = req.user._id
    const tweets = await Tweet.find({owner:user})
    if(!tweets){
        throw new ApiError(500 , "failed to fetch tweet")
    }
    res.status(200).json(new ApiResponse(200 , tweets , "successfully fetched tweets"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId, content} = req.body;
    const user = req.user;
    const tweet = await Tweet.findById(tweetId);
    
    if(!tweet || tweet.owner.toString() !== user._id.toString()){
        throw new ApiError(500 , "failed to find tweet")
    }
    tweet.content = content;
    tweet.save();
    res.status(200).json(new ApiResponse(200 , {} , "successfully updated tweet"))


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.body;
    const owner = req.user._id;
    const tweet = await Tweet.findOneAndDelete({_id:tweetId, owner});
    if(!tweet){
        throw new ApiError(400 , "Failed to delete tweet, either id is wrong or user is wrong")
    }
    res.status(200).json(new ApiResponse(200 , {} , "successfully deleted tweet"));
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
    
}