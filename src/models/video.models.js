import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema = new mongoose.Schema({
    videoFile: {
        type: String, // Cloudinary url
        required: true
    },
    thumbnail: {
        type: String, // Cloudinary url
        required: true
    },
    comments : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    }],
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,  // cloudinary duration
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    isPublished: {
        type: Boolean,
        default: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: true
    }
}, { timestamps: true })

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", VideoSchema);