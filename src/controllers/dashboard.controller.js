import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { User } from '../models/user.models.js'
import { Comment } from '../models/comment.models.js'
import { Like } from '../models/like.models.js'
import { Playlist } from '../models/playlist.models.js'
import { Subscription } from '../models/subscription.models.js'
import { Video } from '../models/video.models.js'
import { apiResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';
import path from 'path';

const getChannelStats = asynchandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new apiError(400, "User Id is Required");
    }

    const user = await User.findById(userId)
        .select("username fullname email avatar cover")
        .populate({
            path: "videos",
            select: "title views likes createdAt",
        })
        .populate({
            path: "subscriptions",
            select: "subscriber channel"
        });

    if (!user) {
        throw new apiError(404, "User Does Not Exist");
    }

    // Calculate totals
    const totalVideos = user.videos.length;
    const totalViews = user.videos.reduce((sum, video) => sum + (video.views || 0), 0);
    const totalLikes = user.videos.reduce((sum, video) => sum + (video.likes || 0), 0);
    const totalSubscribers = user.subscriptions.length;

    return res.status(200).json(
        new apiResponse(200, "Channel Stats Fetched Successfully", {
            user: user,
            totalSubscribers,
            totalVideos,
            totalViews,
            totalLikes
        })
    );
});



const getChannelVideos = asynchandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new apiError(400, "User Id is Required");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new apiError(404, "User Not Found");
    }

    const videos = await Video.find({ owner: userId })
        .populate({
            path: "owner",
            select: "username fullname avatar cover"
        })
        .populate({
            path: "comments",
            select: "user text createdAt",
            populate: {
                path: "user",
                select: "username avatar"
            }
        })
        .sort({ createdAt: -1 }); // latest videos first

    return res.status(200).json(
        new apiResponse(200, "Channel Videos Fetched Successfully", videos)
    );
});


export {
    getChannelStats, 
    getChannelVideos
}