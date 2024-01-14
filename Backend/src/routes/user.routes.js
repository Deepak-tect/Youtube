import { Router } from "express";
import { addToSubsciption, changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, refrehAccessToken, updateAccountDetails, updateAvatar, updateUserCoverImage, uploadVideo, userLoggedOut, userLogin, userRegister, watchVideo } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// router.route("/register").post(userRegister)
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    userRegister
    )
    router.route("/login").post(userLogin)

    router.route("/logout").post(verifyJWT,userLoggedOut)

    router.route("/refresh-token").post(refrehAccessToken);

    router.route("/update-password").post(verifyJWT ,changeCurrentPassword)

    router.route("/update-avatar").post(upload.single("avatar"), verifyJWT , updateAvatar);
    router.route("/update-cover-image").post(upload.single("coverImage"), verifyJWT , updateUserCoverImage);
    router.route("/update-user-detail").post(verifyJWT, updateAccountDetails);
    router.route("/get-user").post(verifyJWT, getCurrentUser)
    router.route("/add-subscribe").post(verifyJWT , addToSubsciption);
    router.route("/channel-details").get(verifyJWT,getUserChannelProfile);
    router.route("/add-to-history").post(verifyJWT , watchVideo);
    router.route("/get-history").get(verifyJWT,getWatchHistory);

    router.route("/add-video").post(upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),verifyJWT , uploadVideo)
export default router