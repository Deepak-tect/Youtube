import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = mongoose.Schema({
    content:{
        type:String,
        require:true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

tweetSchema.plugin(mongooseAggregatePaginate)

export const Tweet = mongoose.model("Tweet", tweetSchema);