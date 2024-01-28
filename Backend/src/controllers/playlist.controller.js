import { PlayList } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const user = req.user;
  const playlist = await PlayList.findOne({
    name,
    description,
    owner: user._id,
  });
  if (playlist) {
    throw new ApiError(401, "playlist already exist");
  }
  await PlayList.create({
    name,
    description,
    owner: user,
  });
  res.status(200).json(new ApiResponse(200, {}, "successfully added playlist"));
  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const user = req.user._id;
  const playlists = await PlayList.find({ owner: user });
  if (playlists.length == 0) {
    throw new ApiError(
      500,
      "failed to find user playlist, create your playlist"
    );
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlists, "successfully fetched playlist"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  //TODO: get playlist by id
  const { playlistId } = req.query;
  const playlist = await PlayList.findById(playlistId);
  if (!playlist) {
    throw new ApiError(501, "failed to find playlist");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Successfully fetched playlist"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.query;
  const playlist = await PlayList.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "failed to find the playlist");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "failed to find the video");
  }
  playlist.videos.push(video);
  await playlist.save();
  res
    .status(200)
    .json(new ApiResponse(200, {}, "successfully added video in playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // TODO: remove video from playlist
  const { playlistId, videoId } = req.query;
  const playlist = await PlayList.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "failed to find playlist");
  }
  let videos = playlist.videos;

  videos = videos.filter(
    (element) => element._id.toString() !== videoId.toString()
  );
  playlist.videos = videos;
  await playlist.save();
  res
    .status(200)
    .json(
      new ApiResponse(200, {}, "sccessfully remove the video from playlist")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // TODO: delete playlist
  const { playlistId } = req.query;
  const playlist = await PlayList.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(400, "failed to find playlist");
  }
  res.status(200).json(new ApiResponse(200, {}, "playlist delete successfuly"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //TODO: update playlist
  const { playlistId } = req.query;
  const { name, description } = req.body;

  if (!playlistId || !name || !description) {
    throw new ApiError(400, "Missing required data");
  }
  const playlist = await PlayList.findByIdAndUpdate(
    playlistId,
    { name, description },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
