import {asynchandler} from '../utils/asynchandler.js';
import { apiError } from '../utils/apierror.js';
import {User} from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
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
        $or: [{ email },{ username }]
    })

    if (existedUser) {
        throw new apiError(409, "User already exists");
    }
    // Step 4 and 5
    const avatarlocalPath = req.files?.avatar[0]?.path
    const coverlocalPath = req.files?.cover[0]?.path

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

export { registerUser };