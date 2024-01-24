import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscriber.controller.js";

const router = Router();

router
  .route("/get-subscriber-of-channel")
  .get(verifyJWT, getUserChannelSubscribers);

router
  .route("/get-channel-i-subscribe-to")
  .get(verifyJWT, getSubscribedChannels);

router
  .route("/toggel-subscription")
  .get(verifyJWT, toggleSubscription);

export default router;
