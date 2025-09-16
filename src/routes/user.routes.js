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
  getWatchHistory
} from '../controllers/user.controller.js';


import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';

import {
  publishVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  addView,
  likeVideo,
  addComment,
  editComment,
  deleteComment,
  getOwnChannelVideos
} from '../controllers/video.controller.js'


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

router.route("/logout").post(verifyJWT, logoutUser)

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

router.route("/view-published-videos").get(
  verifyJWT,
  getAllVideos
)

router.route("/getVideo-ById/:videoId").get(verifyJWT, getVideoById)

router.route("/update-Video/:videoId").put(verifyJWT, updateVideo)

router.route("/delete-Video/:videoId").delete(verifyJWT, deleteVideo)

router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus);

router.route("/:videoId/view").post(addView);

router.route("/:videoId/like").post(verifyJWT, likeVideo);

router.route("/:videoId/comments").post(verifyJWT, addComment);

router.route("/:videoId/comments/:commentId").put(verifyJWT, editComment);

router.route("/:videoId/comments/:commentId").delete(verifyJWT, deleteComment);

router.route("/my-videos").get(verifyJWT, getOwnChannelVideos);


export default router;