import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from '../controllers/comment.controller.js'

const router = Router();
router.use(verifyJWT)
router.route("/:videoId/like").post(toggleVideoLike);