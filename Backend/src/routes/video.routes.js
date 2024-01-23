import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/publish-video").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  verifyJWT,
  publishVideo
);

router.route("/getVideoById").get(getVideoById);

router.route("/updateVideoDetails").post(upload.single("thumbnail"),verifyJWT, updateVideo)

router.route("/deleteVideo").post(verifyJWT,deleteVideo)

router.route("/get-all-video").get(verifyJWT, getAllVideos);

export default router;
