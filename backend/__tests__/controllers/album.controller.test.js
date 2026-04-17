import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";

import {
  deleteAlbum,
  updateAlbum,
} from "../../controllers/album.controller.js";
import AlbumModel from "../../models/album.model.js";
import SongModel from "../../models/song.model.js";

describe("album controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync = jest.fn();
    fs.unlink = jest.fn();
  });

  it("should replace album artwork and log file deletion failures after update", async () => {
    const albumInDb = {
      _id: "album-001",
      photoPath: "/tmp/old.jpg",
      photoLink: "/static/albums/images/old.jpg",
      songs: [{ _id: "song-001" }],
      createdAt: "2024",
      save: jest.fn(),
    };
    AlbumModel.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(albumInDb),
    });
    AlbumModel.findByIdAndDelete = jest.fn();
    AlbumModel.create = jest.fn();
    SongModel.updateMany = jest.fn().mockResolvedValue({});
    fs.existsSync.mockReturnValue(true);
    fs.unlink.mockImplementation((_path, callback) => callback(new Error("unlink failed")));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const req = {
      params: { id: "album-001" },
      body: {
        id: "album-001",
        title: "Updated Album",
        songs: [{ _id: "song-001" }],
      },
      file: { path: "/tmp/new.jpg", filename: "new.jpg" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateAlbum(req, res);

    expect(fs.unlink).toHaveBeenCalledWith("/tmp/old.jpg", expect.any(Function));
    expect(albumInDb.photoPath).toBe("/tmp/new.jpg");
    expect(albumInDb.photoLink).toBe("/static/albums/images/new.jpg");
    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(res.json).toHaveBeenCalledWith({ updated: true });
  });

  it("should recreate the album and remap song references when the id changes", async () => {
    const albumInDb = {
      _id: "album-001",
      photoPath: "/tmp/old.jpg",
      photoLink: "/static/albums/images/old.jpg",
      songs: [{ _id: "song-001" }, { _id: "song-002" }],
      createdAt: "2024",
      save: jest.fn(),
    };
    AlbumModel.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(albumInDb),
    });
    AlbumModel.findByIdAndDelete = jest.fn().mockResolvedValue({ deleted: true });
    AlbumModel.create = jest.fn().mockResolvedValue({ _id: "album-002" });
    SongModel.updateMany = jest.fn().mockResolvedValue({ acknowledged: true });
    fs.existsSync.mockReturnValue(false);
    const req = {
      params: { id: "album-001" },
      body: {
        id: "album-002",
        title: "Updated Album",
        songs: [{ _id: "song-002" }, { _id: "song-003" }],
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateAlbum(req, res);

    expect(AlbumModel.findByIdAndDelete).toHaveBeenCalledWith("album-001");
    expect(AlbumModel.create).toHaveBeenCalledWith({
      _id: "album-002",
      name: "Updated Album",
      photoPath: "/tmp/old.jpg",
      photoLink: "/static/albums/images/old.jpg",
      songs: [{ _id: "song-002" }, { _id: "song-003" }],
      createdAt: "2024",
    });
    expect(SongModel.updateMany).toHaveBeenNthCalledWith(
      1,
      { _id: { $in: ["song-001"] } },
      { $pull: { albums: "album-001" } },
    );
    expect(SongModel.updateMany).toHaveBeenNthCalledWith(
      2,
      { _id: { $in: ["song-003"] } },
      { $push: { albums: "album-002" } },
    );
    expect(SongModel.updateMany).toHaveBeenNthCalledWith(
      3,
      { _id: { $in: ["song-002"] } },
      { $pull: { albums: "album-001" } },
    );
    expect(SongModel.updateMany).toHaveBeenNthCalledWith(
      4,
      { _id: { $in: ["song-002"] } },
      { $push: { albums: "album-002" } },
    );
    expect(albumInDb.save).not.toHaveBeenCalled();
  });

  it("should delete album artwork when deleting an album", async () => {
    AlbumModel.findById = jest.fn().mockResolvedValue({
      _id: "album-001",
      songs: ["song-001"],
      photoPath: "/tmp/album.jpg",
    });
    AlbumModel.findByIdAndDelete = jest.fn().mockResolvedValue({ deleted: true });
    SongModel.updateMany = jest.fn().mockResolvedValue({ acknowledged: true });
    fs.existsSync.mockReturnValue(true);
    fs.unlink.mockImplementation((_path, callback) => callback(null));
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await deleteAlbum({ params: { id: "album-001" } }, res);

    expect(SongModel.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ["song-001"] } },
      { $pull: { albums: "album-001" } },
    );
    expect(fs.unlink).toHaveBeenCalledWith("/tmp/album.jpg", expect.any(Function));
    expect(res.json).toHaveBeenCalledWith({ deleted: true });
  });
});
