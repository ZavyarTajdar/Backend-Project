import { Router } from 'express';
import {   logoutUser, loginUser, registerUser, refreshAccessToken } from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js"
import { verify } from 'crypto';
import { verifyJWT } from '../middlewares/auth.middleware.js';
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

export default router;