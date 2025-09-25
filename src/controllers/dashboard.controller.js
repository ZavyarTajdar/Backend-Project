import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { User } from '../models/user.models.js'
import { Video } from '../models/video.models.js'
import { Subscription } from "../models/subscription.models.js";
import { apiResponse } from '../utils/apiResponse.js';

const getChannelStats = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const { channelId } = req.params;

    if (!channelId) {
        throw new apiError(400, "Channel Id is Required");
    }

    if (!userId) {
        throw new apiError(400, "User Id is Required");
    }

    const user = await User.findById(userId)
        .select("username fullname email avatar cover")
        .setOptions({ strictPopulate: true }); // enable strict populate on this query

    if (!user) {
        throw new apiError(404, "User Does Not Exist");
    }

    const videos = await Video.find({ creator: userId })
        .select("title views likes createdAt")
        .populate({
            path: "creator",
            select: "username avatar",
            options: { strictPopulate: true } // make sure 'creator' exists in Video schema
        });

    const subscriptions = await Subscription.find({ channel: channelId })
        .select("subscriber channel")
        .populate({
            path: "subscriber",
            select: "username avatar",
            options: { strictPopulate: true }
        });

    // Totals
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
    const totalSubscribers = subscriptions.length;

    return res.status(200).json(
        new apiResponse(
            200,
            {
                subscriptions,
                videos,
                user,
                totalSubscribers,
                totalVideos,
                totalViews,
                totalLikes,
            },
            "Channel Stats Fetched Successfully"
        )
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

    const videos = await Video.find({ creator: userId })
        .populate({
            path: "creator",
            select: "username fullname avatar cover"
        })
        .populate({
            path: "comments",
            select: "owner content createdAt",
            populate: {
                path: "owner",
                select: "username avatar"
            }
        })
        .sort({ createdAt: -1 }); // latest videos first
        
    return res.status(200).json(
        new apiResponse(200, videos, "Channel Videos Fetched Successfully")
    );
});


export {
    getChannelStats,
    getChannelVideos
}