import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { User } from '../models/user.models.js';
import { Video } from '../models/video.models.js';
import { apiResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';


const toggleVideoLike = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new apiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, "Video not found");
    }

    const userId = req.user._id;

    // Check if already liked
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if (existingLike) {
        // Unlike (remove like)
        await existingLike.deleteOne();

        const likesCount = await Like.countDocuments({ video: videoId });

        return res.status(200).json(
            new apiResponse(200, { likesCount }, "Video unliked")
        );
    }

    // Add new like
    await Like.create({
        video: videoId,
        likedBy: userId
    });

    const likesCount = await Like.countDocuments({ video: videoId });

    return res.status(200).json(
        new apiResponse(200, { likesCount }, "Video liked")
    );
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}