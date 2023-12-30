import { User } from "../models/user.model.js";
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

    // const {username , email , fullName, password} = req.body
    // const user = req.body;
    
    // if(user.email === '' || user.username === '' || user.fullname) throw new ApiError(400, "please send all the information")
    
    // const existedUser = await User.findOne({
    //     $or: [{ username }, { email }]
    // })

    // if (existedUser) {
    //     throw new ApiError(409, "User with email or username already exists")
    // }
    // // console.log(req.files)
    // const avatarLocalPath = (req.files && req.files.avatar && req.files.avatar[0] && req.files.avatar[0].path) || undefined;;
    
    // if (!avatarLocalPath) {
    //     return res.status(400).json(new ApiError(401))
    // }
    // const coverImageLocalPath = (req.files && req.files.coverImage && req.files.coverImage[0] && req.files.coverImage[0].path) || undefined;;
    
    // console.log(avatarLocalPath);
    // console.log(coverImageLocalPath);
    // const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
    // const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);
    
    // const presentUser = await User.create({
    //     username,
    //     email,
    //     fullName,
    //     avatar: avatarUrl.url,
    //     coverImage: coverImageUrl.url,
    //     password
    // })
    // const createdUser = await User.findById(presentUser._id).select(
    //     "-password -refreshToken"
    // )
    // if (!createdUser) {
    //     throw new ApiError(500, "Something went wrong while registering the user")
    // }

    // return res.status(201).json(
    //     new ApiResponse(200, createdUser, "User registered Successfully")
    // )
    

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
                refreshToken: ""
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
    console.table([fullName,email])
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

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NThkMmVlZTE0NWMwZDEzNTliMzVmODYiLCJpYXQiOjE3MDM4MzU1MDMsImV4cCI6MTcwNDY5OTUwM30.4GBzk9cZmvRcvfmTRvzkCG00sALY9pu5JyCNN6dmQuw

export {userRegister, userLogin,userLoggedOut,refrehAccessToken,changeCurrentPassword,updateAvatar,updateUserCoverImage,getCurrentUser,updateAccountDetails}