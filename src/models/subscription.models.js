import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        subsriber:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        channel:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        
    },
    { 
    timestamps: true 
    }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);