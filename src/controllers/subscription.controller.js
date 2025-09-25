import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { Channel } from '../models/channel.models.js';
import { Subscription } from '../models/subscription.models.js'
import { apiResponse } from '../utils/apiResponse.js';

const toggleSubscription = asynchandler(async (req, res) => {
    const {channelId} = req.params
    const user = req.user._id
    
    if (!channelId) {
        throw new apiError(400, "Channel Id Is Required")
    }

    const channel = await Channel.findById(channelId)

    if (!channel) {
        throw new apiError(404, "Channel Not Found")
    }
    debugger
    // Check if the user is already subscribed to the channel
    const existingSubscribe = await Subscription.findOne({
        channel : channelId,
        subscriber : user 
    })
    if (existingSubscribe) {
        await existingSubscribe.deleteOne();

        channel.subscriber = (channel.subscriber || 0) - 1;
        if (channel.subscriber < 0) channel.subscriber = 0;
        await channel.save();

        return res
        .status(200)
        .json(
            new apiResponse(200, "Unsubscribed Successfully")
        )
    }
    
    await Subscription.create({
        channel : channelId,
        subscriber : user
    })

    channel.subscriber = (channel.subscriber || 0 ) + 1
    await channel.save()

    return res
    .status(200)
    .json(
        new apiResponse(200, "Subscribed Successfully")
    )
})

const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) {
        throw new apiError(400, "Channel Id Is required")
    }

    const channel = await Channel.findById(channelId)

    if (!channel) {
        throw new apiError(404, "Channel not Found")
    }

    const subscribers = await Subscription.find({channel : channelId})
    .populate('subscriber', 'username email');

    return res
    .status(200)
    .json(
        new apiResponse(200, subscribers, "Subscribers Fetched Successfully")
    )
})

const getSubscribedChannels = asynchandler(async (req, res) => {
    const userId = req.user._id

    if (!userId) {
        throw new apiError(400, "Subscriber Id Is required")
    }

    const subscribers = await Subscription.find({subscriber : userId})
    .populate('channel', 'name');

    const channels = subscribers.map(sub => sub.channel);
    return res
    .status(200)
    .json(
        new apiResponse(200, channels, "Subscribed Channels Fetched Successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}