import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import { deleteOldImage } from '../utils/deleteOldImage.js';
import jwt from 'jsonwebtoken';

const generateAcessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiError(504, "Something went wrong while generating Acess And Refresh Token")
    }
}

const registerUser = asynchandler(async (req, res) => {
    // 1:  get user details from frontend
    // 2:  Validation - not empty
    // 3:  check if user already exists by : email and username
    // 4:  check for images
    // 5:  check for avatar
    // 6:  upload to cloudinary, avatar
    // 7:  create user object - create entry in database
    // 8:  remove password and refresh token field from response
    // 9:  check for user creation
    // 10: if create : return response

    // Step 1
    const { fullname, email, username, password } = req.body
    // Step 2
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required");
    }
    // Step 3
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new apiError(409, "User already exists");
    }
    // Step 4 and 5

    const avatarlocalPath = req.files?.avatar[0]?.path
    // const coverlocalPath = req.files?.cover[0]?.path

    let coverlocalPath;
    if (req.files && Array.isArray(req.files.cover) && req.files.cover.length > 0) {
        coverlocalPath = req.files.cover[0].path;
    }
    if (!avatarlocalPath) {
        throw new apiError(400, "Avatar image is required");
    }
    // Step 6
    const avatar = await uploadOnCloudinary(avatarlocalPath)
    const cover = await uploadOnCloudinary(coverlocalPath)


    if (!avatar) {
        throw new apiError(400, "Avatar image is required");
    }

    // Step 7
    const createdUser = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        cover: cover?.url || ""
    })
    // Step 8
    const user = await User.findById(createdUser._id).select("-password -refreshToken")
    // Step 9
    if (!user) {
        throw new apiError(500, "Something Went Wrong While Fetching User");
    }
    // Step 10
    return res.status(201).json(
        new apiResponse(201, user, "User created successfully")
    )
})

const loginUser = asynchandler(async (req, res) => {
    // 1: req body - username, password
    // 2:  if user already exists
    // 3:  username or password 
    // 4:  password compare - if user exists
    // 5:  access token and refresh token
    // 6:  send cookie 

    // Step 1
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new apiError(404, "Give Atleast One Email or Username");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] }).select("+password")

    if (!user) {
        throw new apiError(404, "User Does Not Exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(404, "Password is required");
    }

    const { accessToken, refreshToken } = await generateAcessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"),
        )
})

const logoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new apiResponse(201, {}, "User Logged Out"))
})

const refreshAccessToken = asynchandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incommingRefreshToken) {
        throw new apiError(401, "Unauthorized request - No refresh token");
    }

    try {
        const decoded = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRECT)

        const user = await User.findById(decoded.userId)

        if (!user) {
            throw new apiError(401, "Unauthorized request - No user");
        }

        if (incommingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Unauthorized request - Token mismatch");
        }

        const { accessToken, newRefreshToken } = await generateAcessAndRefreshToken(user._id)
        const option = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(
                new apiResponse(200, { accessToken, newRefreshToken },
                    "Access token Regenerated successfully")
            )
    } catch (error) {
        throw new apiError(401, error?.message || "Something Went Wrong While Refreshing Access Token");
    }
})

const ChangeCurrentUserPassword = asynchandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body

    const user = await User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new apiError(400, "Old Password is incorrect");
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    if (!(newPassword === confirmPassword)) {
        throw new apiError(400, "New Password and Confirm Password do not match");
    }

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asynchandler(async (req, res) => {
    return res
        .status(200)
        .json(new apiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asynchandler(async (req, res) => {
    const { fullname, email, username } = await req.body

    if (!fullname || !email || !username) {
        throw new apiError(400, "Fullname and Email are both required");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email,
                username
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new apiResponse(200, user, "User details updated successfully"))
})

const updateUserAvatar = asynchandler(async (req, res) => {

    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar File is Missing");
    }

    const Avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!Avatar) {
        throw new apiError(400, "Avatar Uploading Failed");
    }

    const existingUser = await User.findById(req.user._id);

    if (existingUser?.avatar) {
        await deleteOldImage(existingUser.avatar);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: Avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Avatar Updated Successfully"))
})

const updateUserCover = asynchandler(async (req, res) => {

    const coverLocalPath = req.file?.path
    if (!coverLocalPath) {
        throw new apiError(400, "Cover File is Missing");
    }

    const cover = await uploadOnCloudinary(coverLocalPath)

    if (!cover) {
        throw new apiError(400, "Cover Uploading Failed");
    }

    const existingUser = await User.findById(req.user._id);

    if (existingUser?.cover) {
        await deleteOldImage(existingUser.cover);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                cover: cover.url
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new apiResponse(200, user, "Cover Updated Successfully"))
})

const deleteUserAccount = asynchandler(async (req, res) => {
    await User.findByIdAndDelete(req.user._id)
    return res
        .status(200)
        .json(new apiResponse(200, {}, "User Deleted Successfully"))
})

const getUserChannelProfie = asynchandler(async (req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new apiError(400, "Username Not Found") 
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size : "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size : "$subscribedTo"
                },
                isSubsribed: {
                    $cond : {
                        if : {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubsribed: 1,
                avatar: 1,
                cover: 1,
                email: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new apiError(401, "Channel Does Not Exists")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, channel[0], "User Channel Fetched Successfully")
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    ChangeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCover,
    getUserChannelProfie,
    deleteUserAccount
};
