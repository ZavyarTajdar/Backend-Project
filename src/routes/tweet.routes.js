import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from '../controllers/tweet.controller.js'

const router = Router();
router.use(verifyJWT)

// Create a tweet
router.route("/publish-tweet").post(createTweet)

// Get all tweets of a specific user (by username)
router.route("/my/tweets").get(getUserTweets)

// Update a tweet
router.route("/:tweetId").put(updateTweet)

// Delete a tweet
router.route("/:tweetId").delete(deleteTweet)


export default router