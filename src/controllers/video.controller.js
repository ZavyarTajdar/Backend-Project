import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { User } from '../models/user.models.js';
import { Video } from '../models/video.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
 
const publishVideo = asynchandler(async (req, res) => {
    try {
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
        .json( new apiResponse(
            201,
            PublishingVideo,
            "Video Published Successfully"
            )
        )
    } catch (error) {
        throw new apiError(501, "Video Failed To Publish")
    }
});

export {
    publishVideo
}