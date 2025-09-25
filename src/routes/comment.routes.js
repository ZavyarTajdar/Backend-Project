import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
} from '../controllers/comment.controller.js'

const router = Router();
router.use(verifyJWT)

router.route("/:videoId/comments").post(addComment);

router.route("/:videoId/comments").get(getVideoComments);

router.route("/:commentId/comments").put(updateComment);

router.route("/:commentId/comments").delete(deleteComment);

export default router;