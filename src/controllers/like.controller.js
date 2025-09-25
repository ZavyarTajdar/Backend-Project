import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { Video } from '../models/video.models.js';
import { Comment } from '../models/comment.models.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Like } from '../models/like.models.js';
import mongoose from 'mongoose';
import { Tweet } from '../models/tweet.models.js';


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

        const CountLike = await Like.countDocuments({ video: videoId });

        return res.status(200).json(
            new apiResponse(200, { likesCount: CountLike }, "Video unliked")
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

const toggleCommentLike = asynchandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new apiError(400, "Comment ID is required TCL");
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new apiError(400, "Comment Not Found TCL");
    }

    const user = req.user._id
    if (!user) {
        throw new apiError(400, "User Not Found TCL");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: user
    });

    if (existingLike) {
        await existingLike.deleteOne()

        const CountLike = await Like.countDocuments({ comment: commentId })

        return res
            .status(200)
            .json(
                new apiResponse(200, { likesCount: CountLike }, "Comment Unlike Successfully")
            )
    }

    await Like.create({
        comment: commentId,
        likedBy: user
    });

    const CountLike = await Like.countDocuments({ comment: commentId })
    return res
    .status(200)
    .json(
        new apiResponse(200, { likesCount: CountLike }, "Comment Like Successfully")
    )

})

const toggleTweetLike = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) {
        throw new apiError(400, "Tweet ID is required TTL");
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new apiError(400, "Tweet Not Found TTL");
    }

    const user = req.user._id
    if (!user) {
        throw new apiError(400, "User Not Found TTL");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: user
    });

    if (existingLike) {
        await existingLike.deleteOne()

        const CountLike = await Like.countDocuments({ tweet: tweetId })

        return res
            .status(200)
            .json(
                new apiResponse(200, { likesCount: CountLike }, "Tweet Unlike Successfully")
            )
    }

    await Like.create({
        tweet: tweetId,
        likedBy: user
    });

    const CountLike = await Like.countDocuments({ tweet: tweetId })
    return res
    .status(200)
    .json(
        new apiResponse(200, { likesCount: CountLike }, "Tweet Like Successfully")
    )
})

const getLikedVideos = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const likedVideos = await Like.find({ likedBy: userId })
        .populate({
            path: "video",
            select: "title thumbnail"
        });

    return res.status(200).json(
        new apiResponse(200, { likedVideos }, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}