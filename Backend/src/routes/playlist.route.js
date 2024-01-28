import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT , createPlaylist);
router.route("/get-user-playlists").get(verifyJWT , getUserPlaylists);
router.route("/get-playlists-by-id").get(getPlaylistById);
router.route("/add-video-playlist").post(addVideoToPlaylist);
router.route("/remove-video-playlist").post(removeVideoFromPlaylist);
router.route("/delete-playlist").post(deletePlaylist);
router.route("/update-playlist").post(updatePlaylist);
export default router;