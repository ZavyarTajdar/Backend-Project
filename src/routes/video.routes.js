// Video 
import { Router } from 'express';
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
  getOwnChannelVideos
} from '../controllers/video.controller.js'


const router = Router();
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

router.route("/my-videos").get(verifyJWT, getOwnChannelVideos);


export default router;

// Perfect Working