import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { Tweet } from '../models/tweet.models.js';
import { apiResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';

const createTweet = asynchandler(async (req, res) => {
    const { content } = req.body
    
    if (!content) {
        throw new apiError(400, "Content Is Required")
    }

    let tweet = await Tweet.create({
        content,
        owner : req.user._id
    })

    tweet = await tweet.populate("owner", "username avatar");
    return res
    .status(200)
    .json(
        new apiResponse(200, tweet, "Tweet Create Successfully")
    )
})

const getUserTweets = asynchandler(async (req, res) => {
    const userId = req.user._id

    if (!userId) {
        throw new apiError(400, "User ID Is Required")
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const tweet = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from : "users",
                localField : 'owner',
                foreignField : "_id",
                as : "userDetails"
            }
        },
         { $unwind: "$userDetails" },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                "userDetails.username": 1,
                "userDetails.avatar": 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { 
            $limit: limit 
        }
    ]);

    return res
    .status(200)
    .json(new apiResponse(200, tweet, "User tweets fetched successfully"));
     
})

const updateTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body;

    if (!tweetId) {
        throw new apiError(400, "Tweet ID Is Required")
    }

    if (!content) {
        throw new apiError(400, "Content is required to update tweet");
    }

    const tweet = await Tweet.findById(tweetId)
    
    if (!tweet) {
        throw new apiError(400, "Tweet Not Found")
    }

    const timeLimit = 10 * 60 * 1000;
    if (Date.now() - tweet.createdAt.getTime() > timeLimit) {
        throw new apiError(403, "You can only edit your tweet within 10 minutes");
    }

    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content
        },
        {
            new: true
        }

    )
    return res
    .status(200)
    .json(
        new apiResponse(200, updateTweet, "Tweet Updated Successfully")
    )
})

const deleteTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId) {
        throw new apiError(400, "Tweet ID Is Required")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    return res
    .status(200)
    .json(
        new apiResponse(200, deletedTweet, "Tweet Deleted Successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}