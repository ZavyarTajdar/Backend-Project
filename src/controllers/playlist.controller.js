import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { Video } from '../models/video.models.js'
import { Playlist } from '../models/playlist.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';
 
const createPlaylist = asynchandler(async (req, res) => {
    const { name, description } = req.body

    if (!(name && description)) {
        throw new apiError(400, "Playlist name and description is required");
    }

    const { videoId } = req.params

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!videoId) {
        throw new apiError(404, "Video Not Found")
    }
    const userId = req.user._id

    const UserVideos = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                title: 1,
                thumbnail: 1,
                createdAt: 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ])

    let playlist = await Playlist.create({
        name,
        description,
        owner: userId,
        videos: UserVideos.map(v => v._id) //v => v._id ka matlab hai: "Har object v me se sirf uska _id field lo."
    })

    playlist = await playlist.populate("videos");

    return res
        .status(200)
        .json(
            new apiResponse(200, playlist, "Video Playlist Created Successfully")
        )

})

const getUserPlaylists = asynchandler(async (req, res) => {
    const userId = req.user._id

    if (!userId) {
        throw new apiError(400, "User ID Is Required")
    }

    const playlists = await Playlist.find({ owner: userId })
        .populate("videos")
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new apiResponse(200, playlists, "User playlists fetched successfully"));
})

const getPlaylistById = asynchandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new apiError(400, "ID Is Required")
    }

    const playlist = await Playlist.findById(playlistId)
    .populate({
        path: "videos",
        select: "title thumbnail videoFile owner createdAt",
        populate: {
            path: "owner",
            select: "username email"
        }
    })
    .populate("owner", "username email")


    if (!playlist) {
        throw new apiError(404, "Playlist Couldn't Found")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, playlist, "Playlist Fetched Successfully")
        )
})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!( playlistId && videoId )) {
        throw new apiError(400, "Playlist and Video Both Id Are Required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(404, "Video not found");
    }
     
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    
    if (playlist.videos.includes(videoId)) {
        throw new apiError(400, "Video already exists in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    const playlistVideo = await Playlist.findById(playlistId)
    .populate({
        path : "videos",
        select: "title thumbnail videoFile owner createdAt",
        populate: {
            path: "owner",
            select: "username email"
        }
    })
    .populate("owner", "username email");

    return res
    .status(200)
    .json(
        new apiResponse(200, playlistVideo,  "Video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    
    if (!( playlistId && videoId )) {
        throw new apiError(400, "Playlist and Video Both Id Are Required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(404, "Video not found");
    }
     
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    
    if (!(playlist.videos.includes(videoId))) {
        throw new apiError(400, "Video already not exists in playlist");
    }

    playlist.videos.pull(videoId);
    await playlist.save();

    const playlistVideo = await Playlist.findById(playlistId)
    .populate({
        path : "videos",
        select: "title thumbnail videoFile owner createdAt",
        populate: {
            path: "owner",
            select: "username email"
        }
    })
    .populate("owner", "username email");

    return res
    .status(200)
    .json(
        new apiResponse(200, playlistVideo,  "Video Remove From playlist successfully")
    )
})

const deletePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params
    
    if (!playlistId) {
        throw new apiError(400, "Playlist Id Are Required")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, "Playlist Deleted Successfully")
    )
})

const updatePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    
    if (!playlistId) {
        throw new apiError(400, "Playlist Id Are Required")
    }

    if (!(name && description)) {
        throw new apiError(400, "Name And Description Both Are Required")
    }

    const UpdatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
        name,
        description
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new apiResponse(200, UpdatedPlaylist, "Playlist Updated Successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}