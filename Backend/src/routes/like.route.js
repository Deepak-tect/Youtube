import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/toggle-like").post(verifyJWT, toggleVideoLike)
router.route("/toggle-comment").post(verifyJWT, toggleCommentLike)
router.route("/toggle-tweet").post(verifyJWT, toggleTweetLike)
router.route("/get-like-video-user").get(verifyJWT, getLikedVideos)
export default router