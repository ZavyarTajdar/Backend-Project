import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { User } from '../models/user.models.js';
import { Video } from '../models/video.models.js';
import { Comment } from '../models/comment.models.js';
import { apiResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';


const getVideoComments = asynchandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId) {
        throw new apiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId)
  
    if (!video) {
        throw new apiError(400, "Video not found");
    }
    const user = req.user._id

    const comment = await Comment.aggregate([
        {
            $match:{
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "userDetails"
            }
        },
        {
            $unwind : "$userDetails"
        },
        {
            $project : {
                _id: 1,
                content: 1,
                createdAt: 1,
                avatar : "$userDetails.avatar",
                username : "$userDetails.username",
            }
        },
        {
            $sort:{
                createdAt : -1
            }
        },
        {
            $skip: (page - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(200, comment, "Comments Fetched Successfully")
    )
})

const addComment = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId) {
        throw new apiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, "Video not found");
    }

    if (!content) {
        throw new apiError(400, "Comment content is required");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });
    video.comments.push(comment._id);
    await video.save();

    // Populate owner before sending response (optional)
    const populatedComment = await comment.populate({
        path: "owner",
        select: "username avatar"
    });

    return res.status(200).json(
        new apiResponse(200, populatedComment, "Comment posted successfully")
    );
});

const updateComment = asynchandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
        throw new apiError(400, "Comment ID is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    if (!comment.owner.equals(req.user._id)) {
        throw new apiError(403, "You can only edit your own comment");
    }

    // 10 minutes time limit
    const timeLimit = 10 * 60 * 1000;
    if (Date.now() - comment.createdAt.getTime() > timeLimit) {
        throw new apiError(403, "You can only edit your comment within 10 minutes");
    }

    comment.content = content;
    await comment.save();

    return res.status(200).json(
        new apiResponse(200, comment, "Comment updated successfully")
    );
});

const deleteComment = asynchandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new apiError(400, "Comment ID is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    if (!comment.owner.equals(req.user._id)) {
        throw new apiError(403, "You can only delete your own comment");
    }

    const DelComment = await comment.deleteOne();

    return res.status(200).json(
        new apiResponse(200, DelComment, "Comment deleted successfully")
    );
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}