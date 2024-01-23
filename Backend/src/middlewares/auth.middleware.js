import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
const verifyJWT = async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
    // try {
    //     const refreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "")
    //     if (!refreshToken) {
    //         throw new ApiError(401, "Unauthorized request")
    //     }
    //     const userId = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)._id;
    //     const user = await User.findById(userId);
    //     if(!user) throw new ApiError(404,"user cookie invalid")
    //     req.user = user;
    //     next()
    // } catch (error) {
    //     throw new ApiError(401, error?.message || "Invalid access token")
    // }
}

export {verifyJWT}