import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        subscriber: { type: Number, default: 0 },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Channel = mongoose.model("Channel", channelSchema);    