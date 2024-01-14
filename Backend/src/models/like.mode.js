import mongoose, { Schema } from "mongoose";

const likeSchema  = mongoose.Schema({
    comment:{
        type: Schema.Types.ObjectId,
        ref:"Comment"
    },
    likeBy:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    video:{
        type: Schema.Types.ObjectId,
        ref:"Video"
    },
    comment:{
        type: Schema.Types.ObjectId,
        ref:"Tweet"
    }
},{timestamps:true})

export const Like = mongoose.model("Like",likeSchema);

