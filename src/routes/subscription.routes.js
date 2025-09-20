import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from '../controllers/subscription.controller.js';

const router = Router();
router.use(verifyJWT);

router.route("/subscribe/:channelId").post(toggleSubscription)

router.route("/getSubscribers/:channelId").get(getUserChannelSubscribers)

router.route("/getchannelsubscribed/:subscriberId").get(getSubscribedChannels)


export default router;
