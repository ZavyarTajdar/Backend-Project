import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // jwt is a bearer token means it`s like a key for accessing data  
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, //  It ignores whitespace
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String, // Cloudinary url
        required: true
    },
    cover:{
        type: String, // Cloudinary url
    },
    watchHistory:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    password:{
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    },
    refreshToken:{
        type: String
    }
}, {timestamps: true});

UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRECT,
        { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.generateRefreshToken = function(){
     return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
        },
        process.env.REFRESH_TOKEN_SECRECT,
        { 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", UserSchema);