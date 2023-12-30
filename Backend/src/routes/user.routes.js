import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, refrehAccessToken, updateAccountDetails, updateAvatar, updateUserCoverImage, userLoggedOut, userLogin, userRegister } from "../controllers/user.controller.js";
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
export default router