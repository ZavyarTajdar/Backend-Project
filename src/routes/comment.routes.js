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

router.route("/:videoId/comments/:commentId").put(updateComment);

router.route("/:videoId/comments/:commentId").delete(deleteComment);