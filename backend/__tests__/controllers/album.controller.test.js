import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";

import { deleteAlbum, getAllOrSearchAlbums, updateAlbum } from "../../controllers/album.controller.js";
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
      updatedAt: expect.any(Date),
    });
    expect(SongModel.updateMany).toHaveBeenNthCalledWith(
      1,
      { _id: { $in: ["song-001"] } },
      { $pull: { albums: "album-001" }, $set: { updatedAt: expect.any(Date) } },
    );
    expect(SongModel.updateMany).toHaveBeenNthCalledWith(
      2,
      { _id: { $in: ["song-003"] } },
      { $push: { albums: "album-002" }, $set: { updatedAt: expect.any(Date) } },
    );
    expect(SongModel.updateMany).toHaveBeenNthCalledWith(
      3,
      { _id: { $in: ["song-002"] } },
      { $pull: { albums: "album-001" }, $set: { updatedAt: expect.any(Date) } },
    );
    expect(SongModel.updateMany).toHaveBeenNthCalledWith(
      4,
      { _id: { $in: ["song-002"] } },
      { $push: { albums: "album-002" }, $set: { updatedAt: expect.any(Date) } },
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
      { $pull: { albums: "album-001" }, $set: { updatedAt: expect.any(Date) } },
    );
    expect(fs.unlink).toHaveBeenCalledWith("/tmp/album.jpg", expect.any(Function));
    expect(res.json).toHaveBeenCalledWith({ deleted: true });
  });

  describe("getAllOrSearchAlbums with syncSince", () => {
    it("should return all albums when syncSince is absent", async () => {
      AlbumModel.find = jest.fn().mockResolvedValue([
        { _doc: { _id: "a1", name: "Album 1", songs: ["s1"], photoPath: "/tmp/a.jpg" }, songs: ["s1"], songFilePath: null },
        { _doc: { _id: "a2", name: "Album 2", songs: [], photoPath: null }, songs: [], songFilePath: null },
      ]);
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getAllOrSearchAlbums({ query: {} }, res);

      expect(AlbumModel.find).toHaveBeenCalledWith({}, null);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should filter albums by syncSince date", async () => {
      AlbumModel.find = jest.fn().mockResolvedValue([
        { _doc: { _id: "a1", name: "Updated Album", songs: ["s1"], photoPath: "/tmp/a.jpg" }, songs: ["s1"], songFilePath: null },
      ]);
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const syncDate = "2025-01-01T00:00:00.000Z";

      await getAllOrSearchAlbums({ query: { syncSince: syncDate } }, res);

      expect(AlbumModel.find).toHaveBeenCalledWith(
        { updatedAt: { $gte: expect.any(Date) } },
        null
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return empty array when syncSince is in the future", async () => {
      AlbumModel.find = jest.fn().mockResolvedValue([]);
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const futureDate = new Date(Date.now() + 86400000 * 365).toISOString();

      await getAllOrSearchAlbums({ query: { syncSince: futureDate } }, res);

      expect(AlbumModel.find).toHaveBeenCalledWith(
        { updatedAt: { $gte: expect.any(Date) } },
        null
      );
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should combine syncSince with search query", async () => {
      AlbumModel.find = jest.fn().mockReturnValue({ maxTimeMS: jest.fn().mockResolvedValue([]) });
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getAllOrSearchAlbums({ query: { q: "Grace", syncSince: "2025-01-01T00:00:00.000Z" } }, res);

      expect(AlbumModel.find).toHaveBeenCalledWith(
        { name: { $regex: expect.any(RegExp) }, updatedAt: { $gte: expect.any(Date) } },
        null
      );
    });
  });

  describe("getAllOrSearchAlbums with idsOnly", () => {
    it("should return only album ids when idsOnly is set", async () => {
      const lean = jest.fn().mockResolvedValue([{ _id: "a1" }, { _id: "a2" }]);
      AlbumModel.find = jest.fn().mockReturnValue({ lean });
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getAllOrSearchAlbums({ query: { idsOnly: true } }, res);

      expect(AlbumModel.find).toHaveBeenCalledWith({}, "_id");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ albumIds: ["a1", "a2"] });
    });

    it("should apply the syncSince filter when idsOnly is combined with syncSince", async () => {
      const lean = jest.fn().mockResolvedValue([{ _id: "a1" }]);
      AlbumModel.find = jest.fn().mockReturnValue({ lean });
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getAllOrSearchAlbums(
        { query: { idsOnly: true, syncSince: "2025-01-01T00:00:00.000Z" } },
        res
      );

      expect(AlbumModel.find).toHaveBeenCalledWith(
        { updatedAt: { $gte: expect.any(Date) } },
        "_id"
      );
      expect(res.json).toHaveBeenCalledWith({ albumIds: ["a1"] });
    });
  });

  describe("getAllOrSearchAlbums search time limit", () => {
    // A query that accepts any chain order and resolves to `result` when awaited.
    const chainable = (result, limits) => {
      const query = {
        maxTimeMS: jest.fn((ms) => {
          limits.push(ms);
          return query;
        }),
        lean: jest.fn(() => query),
        then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
      };
      return query;
    };

    it("should limit the query of an album search to 5 seconds", async () => {
      const limits = [];
      const albums = [{ _doc: { _id: "album-001", name: "Grace" }, songs: ["song-001"] }];
      AlbumModel.find = jest.fn(() => chainable(albums, limits));
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getAllOrSearchAlbums({ query: { q: "Grace" } }, res);

      expect(limits).toEqual([5000]);
      expect(res.json).toHaveBeenCalledWith([
        { _id: "album-001", name: "Grace", numOfSongs: 1, songs: undefined, photoPath: undefined },
      ]);
    });

    it("should limit the ids-only query of an album search to 5 seconds", async () => {
      const limits = [];
      AlbumModel.find = jest.fn(() => chainable([{ _id: "a1" }], limits));
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getAllOrSearchAlbums({ query: { q: "Grace", idsOnly: true } }, res);

      expect(limits).toEqual([5000]);
      expect(res.json).toHaveBeenCalledWith({ albumIds: ["a1"] });
    });

    it("should not limit the queries of a request without a search text", async () => {
      const limits = [];
      AlbumModel.find = jest.fn(() => chainable([], limits));
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getAllOrSearchAlbums({ query: {} }, res);
      await getAllOrSearchAlbums({ query: { idsOnly: true } }, res);

      expect(limits).toEqual([]);
    });

    it("should keep the names projection and the syncSince filter next to the literal name match", async () => {
      const limits = [];
      AlbumModel.find = jest.fn(() => chainable([], limits));
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getAllOrSearchAlbums(
        { query: { q: "a.b", names: true, syncSince: "2025-01-01T00:00:00.000Z" } },
        res,
      );

      const [filter, projection] = AlbumModel.find.mock.calls[0];
      expect(projection).toEqual({ name: true });
      expect(filter.updatedAt).toEqual({ $gte: expect.any(Date) });
      expect(filter.name.$regex.test("a.b")).toBe(true);
      expect(filter.name.$regex.test("axb")).toBe(false);
    });
  });
});
