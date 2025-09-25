import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from '../controllers/playlist.controller.js';

const router = Router();
router.use(verifyJWT);

router.post("/create-playlists/:videoId", createPlaylist);

router.get("/get-playlists", getUserPlaylists);

router.get("/playlists/:playlistId", getPlaylistById);

router.put("/update-playlists/:playlistId", updatePlaylist);

router.delete("/delete-playlists/:playlistId", deletePlaylist);

router.post("/:playlistId/videos/:videoId", addVideoToPlaylist);

router.delete("/:playlistId/videos/:videoId", removeVideoFromPlaylist);

export default router;

