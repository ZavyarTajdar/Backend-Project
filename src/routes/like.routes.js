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
// Video likes
router.route("/videos/:videoId/like").post(toggleVideoLike);
router.route("/videos/:videoId/likes").get(getLikedVideos);

// Comment likes
router.route("/comments/:commentId/like").post(toggleCommentLike);

// Tweet likes
router.route("/tweets/:tweetId/like").post(toggleTweetLike);

