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

router.post("/playlists", createPlaylist);

router.get("/playlists", getUserPlaylists);

router.get("/playlists/:playlistId", getPlaylistById);

router.put("/playlists/:playlistId", updatePlaylist);

router.delete("/playlists/:playlistId", deletePlaylist);

router.post("/playlists/:playlistId/videos/:videoId", addVideoToPlaylist);

router.delete("/playlists/:playlistId/videos/:videoId", removeVideoFromPlaylist);

export default router;

