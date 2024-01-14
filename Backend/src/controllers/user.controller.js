import mongoose from "mongoose";
import { Subsciption } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
// data rec
    // data field vaildation
    // check user is already present
    // check for avatar and cover photo
    // create obejct of user
    // remove password field for response


const generateAccessTokenandRefreshToken = async(user)=>{
    try {
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        // if(!accessToken || !refreshToken) throw new ApiError(501,"server error")
        await User.updateOne({_id:user._id} ,{$set:{refreshToken:refreshToken}})
        // user.refreshToken = refreshToken
        // await user.save({ validateBeforeSave: false })
        return {accessToken , refreshToken};
    } catch (error) {
        throw new ApiError(500,"server error: error while creating token ")
    }
}

const userRegister = asyncHandler(async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

    
    

})

const userLogin = asyncHandler(async(req,res)=>{
    const {username , email,password} = req.body;
    // console.table([username, email])
    if(!username && !email){
        // throw new ApiError(400, "All fields are required")
        throw new ApiError(401,"send email and username");
    }
    const user = await User.findOne({$or:[{email},{username}]});
    if(!user){
        throw new ApiError(404, "user does not exist")
    }
    const passwordCheck = await user.isPasswordCorrect(password)
    if(!passwordCheck){
        throw new ApiError(401,"enter correct password")
    }
    const {accessToken, refreshToken} = await generateAccessTokenandRefreshToken(user)

    const loginUser = await User.findOne({$or:[{username},{email}]}).select("-password -refreshToken")
    // console.log("access",refreshToken);
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loginUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
    
})

const userLoggedOut = asyncHandler(async(req,res)=>{
    
    // await User.updateOne({id:user._id},{$set:{refreshToken:undefined}})
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""    // can be use 1 to unset 
            }
        },
        {
            new: true
        }
    )
    // const user = await User.findById(req.user._id)
    // console.log(updatedUser)
    

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})
const refrehAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError('401',"unauthorised member")
    } 
    const userId = jwt.verify(incomingRefreshToken ,process.env.REFRESH_TOKEN_SECRET)._id;
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError('404',"invalid token")
    }
    if(user.refreshToken !== incomingRefreshToken){
        throw new ApiError(401,"invalid token")
    }
    const {accessToken , refreshToken} = await generateAccessTokenandRefreshToken(user);
    const options = {
        httpOnly:true,
        secure:true
    }
    res.status(200).cookie("accessToken" , accessToken , options).cookie("refreshToken" , refreshToken , options).json(
        new ApiResponse(200 , {accessToken , refreshToken}, "token refresh successfully")
    )

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldpassword , newpassword} = req.body;
    // console.log(req.user);
    const user = await User.findById(req.user._id);
    const checkUser = await user.isPasswordCorrect(oldpassword);
    if(!checkUser){
        throw new ApiError(401,"invalid oldpassword");
    }
    user.password = newpassword;
    await user.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarPath = req.file.path;
    
    const avatarUrl = await uploadOnCloudinary(avatarPath);
    if(!avatarUrl.url){
        throw new ApiError(500 , "failed to upload on cloudinary");
    }
    const userId = req.user._id;
    const user = await User.findById(userId);
    await User.updateOne({_id: userId}, {$set:{avatar:avatarUrl.url}})
    res.status(200).json(new ApiResponse(201 , {}, "successfully updated avatar"))
    

})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body
    // console.table([fullName,email])
    if (!fullName && !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});


const addToSubsciption = asyncHandler(async(req,res)=>{
    
    const channelName = req.query.username;
    const user = req.user;
    if(!channelName){
        throw new ApiError(400 , "url channel name not present");
    }
    const channel = await User.findOne({username : channelName});
    
    if(!channel){
        throw new ApiError(400, "channel does not exist");
    }
    await Subsciption.create({
        subscriber:user,
        channel:channel
    })
    res.status(200).json(new ApiResponse(201, {},"subscibe successfully"));

})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const channelName = req.query.username;
    if(!channelName){
        throw new ApiError(400 , "url channel name not present");
    }
    // console.log(req.user);
    
    const channel = await User.aggregate([
        {
            $match: {
                username: channelName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subsciptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subsciptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?._id,
                                "$subscribers.subscriber" // Assuming this points directly to an array of subscriber IDs
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
                
                
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )

})


const uploadVideo = asyncHandler(async(req,res)=>{
    const user = req.user;
    const {title , description, duration} = req.body;
    const videoPath = req.files.video[0].path;
    const thumbnailPath = req.files.thumbnail[0].path;
    const videoUploadOnCloudinary = await uploadOnCloudinary(videoPath);
    if(!videoUploadOnCloudinary) throw new ApiError(500,"video fail to upload on cloudinary")
    const thumbnailUploadOnCloudinary = await uploadOnCloudinary(thumbnailPath);
    if(!thumbnailUploadOnCloudinary) throw new ApiError(500,"thumbnail fail to upload on cloudinary")
    
    await Video.create({
        videoFile:videoUploadOnCloudinary.url,
        thumbnail:thumbnailUploadOnCloudinary.url,
        title,
        description,
        duration,
        owner:user
    })
    
    
    res.status(200).json(new ApiResponse(200 , {}, "video uploaded successfully"));

})

const watchVideo = asyncHandler(async(req,res)=>{
    const user = req.user;
    const {_id} = req.body;
    // console.log(_id);


    const video = await Video.findById(_id);
    // console.log(video);
    if(!video){
        throw new ApiError(500 , "failded to find video , send correct id");
    }
    user.watchHistory.push(video);
    await user.save()
    res.status(200).json(new ApiResponse(200 , {} , "video added in history"));
    

})


const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id) 
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"_id",
                            foreignField:"_id",
                            as :"owner"
                        },
                        
                    }
                ]
            }
        }
    ])
    console.log(user);
    res.send("ok");
})

export {userRegister, userLogin,userLoggedOut,refrehAccessToken,changeCurrentPassword,updateAvatar,updateUserCoverImage,getCurrentUser,updateAccountDetails,addToSubsciption,getUserChannelProfile,uploadVideo,watchVideo,getWatchHistory}