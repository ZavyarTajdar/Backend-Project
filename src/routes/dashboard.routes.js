import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    getChannelStats, 
    getChannelVideos
} from '../controllers/dashboard.controller.js';

const router = Router();
router.use(verifyJWT);

router.get("/channel/stats/:channelId", getChannelStats);

router.get("/channel/videos/:userId", getChannelVideos);

export default router;