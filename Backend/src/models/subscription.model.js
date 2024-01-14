import mongoose,{Schema} from "mongoose";


const subscriptionSchema = mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User"
    }
});

export const Subsciption = mongoose.model("Subsciption", subscriptionSchema);