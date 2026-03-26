import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  createPlaylist,
  getAllOrSearchPlaylists,
  getPlaylist,
  patchPlaylist,
} from "../../controllers/playlist.controller.js";
import PlaylistModel from "../../models/playlist.model.js";
import { ForbiddenError, NotFoundError } from "../../utils/error.util.js";

describe("playlist controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject anonymous myPlaylists requests", async () => {
    await expect(getAllOrSearchPlaylists({ query: { myPlaylists: true } }, {})).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("should query public playlists for anonymous users", async () => {
    const playlists = [{ _doc: { _id: "playlist-001", name: "Public" }, songs: ["song-001"] }];
    const listQuery = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue(playlists) };
    const countQuery = { countDocuments: jest.fn().mockResolvedValue(1) };
    PlaylistModel.find = jest.fn((selection, projection) => {
      if (projection) {
        return listQuery;
      }

      return countQuery;
    });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllOrSearchPlaylists({ query: {} }, res);

    expect(PlaylistModel.find).toHaveBeenNthCalledWith(1, { visibility: "public" }, "name songs");
    expect(res.json).toHaveBeenCalledWith({
      playlists: [{ _id: "playlist-001", name: "Public", numOfSongs: 1, songs: undefined }],
      totalPages: 1,
    });
  });

  it("should include member-visible playlists for member users", async () => {
    const listQuery = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([]) };
    const countQuery = { countDocuments: jest.fn().mockResolvedValue(0) };
    PlaylistModel.find = jest.fn((selection, projection) => {
      if (projection) {
        return listQuery;
      }

      return countQuery;
    });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllOrSearchPlaylists({ query: {}, user: { _id: "user-001", role: "member" } }, res);

    expect(PlaylistModel.find).toHaveBeenNthCalledWith(
      1,
      {
        $or: [
          { visibility: { $in: ["members", "public"] } },
          { visibility: "private", creator: "user-001" },
        ],
      },
      "name songs",
    );
  });

  it("should default new playlists to private visibility", async () => {
    PlaylistModel.create = jest.fn().mockResolvedValue({ _id: "playlist-001" });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createPlaylist(
      {
        body: { name: "Practice Songs", songs: ["song-001"] },
        user: { _id: "user-001", role: "member" },
      },
      res,
    );

    expect(PlaylistModel.create).toHaveBeenCalledWith({
      name: "Practice Songs",
      songs: ["song-001"],
      visibility: "private",
      creator: "user-001",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should hide members playlists from anonymous users", async () => {
    const playlist = {
      _doc: { _id: "playlist-001", name: "Members Playlist", visibility: "members" },
      visibility: "members",
      creator: { _id: "user-001", toString: () => "user-001" },
      songs: [],
    };
    const populateCreator = jest.fn().mockResolvedValue(playlist);
    const populateSongs = jest.fn().mockReturnValue({ populate: populateCreator });
    PlaylistModel.findById = jest.fn().mockReturnValue({ populate: populateSongs });

    await expect(getPlaylist({ params: { id: "playlist-001" } }, {})).rejects.toThrow(NotFoundError);
  });

  it("should patch playlist visibility and songs independently", async () => {
    const playlistInDb = {
      visibility: "private",
      songs: ["song-001"],
      save: jest.fn(),
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await patchPlaylist(
      { body: { visibility: "public", addSongs: ["song-002"], removeSongs: ["song-001"] }, playlist: playlistInDb },
      res,
    );

    expect(playlistInDb.visibility).toBe("public");
    expect(playlistInDb.songs).toEqual(["song-002"]);
    expect(playlistInDb.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ updated: true });
  });
});
