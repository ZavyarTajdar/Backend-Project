import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from '../controllers/like.controller.js'

const router = Router();
router.use(verifyJWT)
// Video likes
router.route("/:videoId/like").post(toggleVideoLike);
router.route("/:userId/likes").get(getLikedVideos);

// Comment likes
router.route("/:commentId/liked").post(toggleCommentLike);

// Tweet likes
router.route("/:tweetId/likesd").post(toggleTweetLike);

export default router