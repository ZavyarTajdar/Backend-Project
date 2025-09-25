import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { Video } from '../models/video.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';


const publishVideo = asynchandler(async (req, res) => {

    const { title, description, category } = req.body;


    if ([title, description, category].some(field => !field || field.trim() === "")) {
        throw new apiError(400, "Title, description and category are required");
    }

    let videoLocalPath = req.files?.videoFile[0]?.path
    let thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath) {
        throw new apiError(400, "Video file is missing");
    }

    if (!thumbnailLocalPath) {
        throw new apiError(400, "Thumbnail is missing");
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoUpload?.url) {
        throw new apiError(500, "Video upload failed");
    }
    if (!thumbnailUpload?.url) {
        throw new apiError(500, "Thumbnail upload failed");
    }

    // Save video in DB
    const PublishingVideo = await Video.create({
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        title,
        description,
        duration: videoUpload.duration,
        creator: req.user._id,
        category
    })

    // Return Response
    return res
        .status(201)
        .json(new apiResponse(
            201,
            PublishingVideo,
            "Video Published Successfully"
        )
        )

});

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new apiError(400, "Video ID is Required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(404, "Video Not Found")
    }

    const videos = await Video.aggregate([
        {
            $match: { isPublished: true }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creator"
            }
        },
        {
            $unwind: "$creator"
        },
        {
            $project: {
                likes: 0,
                "creator.password": 0,
                "creator.__v": 0,
                "creator.refreshToken": 0,   // hide refreshToken
                "creator.createdAt": 0,      // optional hide
                "creator.updatedAt": 0,        // optional hide
                "creator.watchHistory": 0
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return res
        .status(200)
        .json(
            new apiResponse(200, videos, "Video Fetched Successfully!")
        )
})

const getAllVideos = asynchandler(async (req, res) => {
    const videos = await Video.aggregate([
        {
            $match: { isPublished: true }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creator"
            }
        },
        {
            $unwind: "$creator"
        },
        {
            $project: {
                likes: 0,
                "creator.password": 0,
                "creator.__v": 0,
                "creator.refreshToken": 0,   // hide refreshToken
                "creator.createdAt": 0,      // optional hide
                "creator.updatedAt": 0,        // optional hide
                "creator.watchHistory": 0
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return res
        .status(200)
        .json(new apiResponse(200, videos, "All Published Videos Fetched Successfully"));
});


const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new apiError(400, "Video ID is required");
    }

    const allowedUpdates = ["title", "description", "isPublished"];

    // Pick only allowed keys from req.body
    const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
        }, {});


    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updates
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-videoFile -duration")

    if (!video) {
        throw new apiError(404, "Video Failed To Update")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, video, "Video Update Successfully! ")
        )
})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new apiError(400, "Video ID is required");
    }
    // delete only from user not from DB
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: false
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, video, "Video deleted for user (unpublished) successfully!")
        );
})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new apiError(404, "ID Is Required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(404, "Video Not Found")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
        .status(200)
        .json(
            new apiResponse(200, video.isPublished, "Video Status Update Successfully")
        )
})

const addView = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new apiError(400, "Could Not found ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(404, "Video Not Found")
    }

    video.views = (video.views || 0) + 1;
    await video.save()

    return res
        .status(200)
        .json(
            new apiResponse(200, { views: video.views }, "Video Status Update Successfully")
        )
})

const getOwnChannelVideos = asynchandler(async (req, res) => {
    const userId = req.user._id; // (creator)

    const videos = await Video.find({ creator: userId });

    return res
        .status(200)
        .json(
            new apiResponse(200, videos, "Your Own Channel All Videos Found Successfully")
        )
})

export {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    addView,
    getOwnChannelVideos
}

// Perfect Working