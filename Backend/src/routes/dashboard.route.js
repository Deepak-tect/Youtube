import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/get-channel-stats").get(verifyJWT, getChannelStats);
router.route("/get-channel-video").get(verifyJWT, getChannelVideos);

export default router;