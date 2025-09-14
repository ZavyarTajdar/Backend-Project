import { Router } from 'express';
import {   
  logoutUser, 
  loginUser, 
  registerUser, 
  refreshAccessToken, 
  updateUserAvatar, 
  updateUserCover, 
  getUserChannelProfile, 
  ChangeCurrentUserPassword, 
  getCurrentUser, 
  updateAccountDetails, 
  deleteUserAccount, 
  getWatchHistory } from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { publishVideo } from '../controllers/video.controller.js'
const router = Router();


router.post("/register", 
    upload.fields([
        {
            name: "avatar", 
            maxCount: 1
        },
        {
            name: "cover",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser)

// secured Route

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refreshToken").post(refreshAccessToken)

router.route("/Avatar")
.patch(
  verifyJWT,                 // if you use JWT auth
  upload.single("avatar"),   // <--- multer middleware
  updateUserAvatar
);

router.route("/CoverImage")
.patch(
  verifyJWT,                 // if you use JWT auth
  upload.single("cover"),   // <--- multer middleware
  updateUserCover
);

router.route("/ChangePassword")
.post(
  verifyJWT,
  ChangeCurrentUserPassword
)

router.route("/updateAccountDetails")
.patch(
  verifyJWT,
  updateAccountDetails
)

router.route("/c/:username") // its essential way
.get(
  verifyJWT,
  getUserChannelProfile
)

router.route("/getCurrentUser")
.get(
  verifyJWT,
  getCurrentUser
)

router.route("/history")
.get(
  verifyJWT,
  getWatchHistory
)
router.route("/delete-account")
.delete(
  verifyJWT, 
  deleteUserAccount
);

// Video 

router.route("/publish-newvideo").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  publishVideo
);

export default router;