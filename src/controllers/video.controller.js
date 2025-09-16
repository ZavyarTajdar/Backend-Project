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

    return res
    .status(200)
    .json(
        new apiResponse(200, video, "Video Fetched Successfully!")
    )
})

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
    const {videoId} = req.params
    
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
        new apiResponse(200, {views: video.views}, "Video Status Update Successfully")
    )
})

const likeVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new apiError(400, "Could Not found ID!")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(404, "Failed To Fetch VideoID")
    }
    
    const userId = req.user._id;

    if (video.likes.includes(userId)) {
        // If already liked, remove the like (toggle)
        video.likes.pull(userId)
        await video.save()
        // return response
        return res.status(200).json({
            success: true,
            message: "Video unliked",
            likesCount: video.likes.length
        });
    }else{
        video.likes.push(userId)
        await video.save()

        return res
        .status(200)
        .json({
            success: true,
            message: "Video liked",
            likesCount: video.likes.length
        });
    }
}) 

const addComment = asynchandler(async (req, res) => {
    const { videoId } = req.params
    const { comment } = req.body;

    if (!videoId) {
        throw new apiError(400, "Failed To Find ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(404, "Did not Find Such Video")
    }

    video.comments.push({
        comment,
        user: req.user._id
    })
    await video.save()

    return res
    .status(200)
    .json(
        new apiResponse(200, video.comments, "Comment Posted Successfully")
    )
}) 

const editComment = asynchandler(async (req, res) => {
    const { videoId, commentId } = req.params
    const { comment } = req.body;

    if (!videoId || !commentId) {
        throw new apiError(400, "Video ID and Comment ID are required");
    }

    const video = await Video.findById(videoId);

    if (!video) throw new apiError(404, "Video not found");

    if (!comment) {
        throw new apiError(400, "New comment text is required");
    }
    const existedcomment = video.comments.id(commentId)

    if (!existedcomment) {
        throw new apiError(404, "Comment not found");
    }

    if (!existedcomment.user.equals(req.user._id)) {
        throw new apiError(403, "You can only edit your own comment");
    }

    // Time limit check (10 minutes = 600,000 ms)
    const timeLimit = 10 * 60 * 1000;

    const now = Date.now();
    if (now - existedcomment.createdAt.getTime() > timeLimit) {
        throw new apiError(403, "You can only edit your comment within 10 minutes");
    }

    existedcomment.comment = comment;
    await video.save();

    return res.status(200).json(
        new apiResponse(200, existedcomment, "Comment updated successfully")
    );
})

const deleteComment = asynchandler(async (req, res) => {
    const { videoId, commentId } = req.params

    if (!videoId || !commentId) {
        throw new apiError(400, "Video ID and Comment ID are required");
    }

    const video = await Video.findById(videoId);

    if (!video) throw new apiError(404, "Video not found");

    const comment = video.comments.id(commentId)

    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    if (!comment?.user?.equals(req.user._id)) {
        throw new apiError(403, "You can only delete your own comment");
    }

    comment.remove(); // remove the subdocument
    await video.save();

    return res.status(200).json(
        new apiResponse(200, video.comments, "Comment deleted successfully")
    );
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
    likeVideo,
    addComment,
    editComment,
    deleteComment,
    getOwnChannelVideos
}