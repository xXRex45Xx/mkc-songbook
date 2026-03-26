import { beforeEach, describe, expect, it, jest } from "@jest/globals";
var mockSongFindById = jest.fn();
var mockSongFindByIdAndDelete = jest.fn();
var mockSongCreate = jest.fn();
var mockAlbumFindById = jest.fn();
var mockCreateReadStream = jest.fn();
var mockExistsSync = jest.fn();
var mockUnlink = jest.fn();
var mockStatSync = jest.fn();

jest.mock("fs", () => ({
  __esModule: true,
  default: {
    createReadStream: mockCreateReadStream,
    existsSync: mockExistsSync,
    unlink: mockUnlink,
    statSync: mockStatSync,
  },
}));

import {
  addSong,
  deleteSong,
  getAllOrSearchSongs,
  patchSong,
  streamSongAudio,
  updateSong,
} from "../../controllers/song.controller.js";
import AlbumModel from "../../models/album.model.js";
import fs from "fs";
import SongModel from "../../models/song.model.js";
import { NotFoundError, ServerFaultError } from "../../utils/error.util.js";

describe("song controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SongModel.findById = mockSongFindById;
    SongModel.findByIdAndDelete = mockSongFindByIdAndDelete;
    SongModel.create = mockSongCreate;
    AlbumModel.findById = mockAlbumFindById;
    fs.existsSync = mockExistsSync;
    fs.unlink = mockUnlink;
    fs.statSync = mockStatSync;
    fs.createReadStream = mockCreateReadStream;
  });

  it("should add a song and attach it to album models", async () => {
    const saveAlbum = jest.fn();
    const album = { songs: [], save: saveAlbum };
    mockSongCreate.mockResolvedValue({ _id: "song-001" });
    const req = {
      body: {
        id: "song-001",
        title: "Amazing Grace",
        lyrics: "lyrics",
        chord: "C",
        tempo: 120,
        rythm: "4/4",
        albums: [album],
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addSong(req, res);

    expect(album.songs).toEqual([{ _id: "song-001" }]);
    expect(saveAlbum).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should replace audio and album relationships when updating a song", async () => {
    const oldAlbum = { songs: ["song-001"], save: jest.fn() };
    const newAlbum = { songs: [], save: jest.fn() };
    const songInDb = {
      _id: "song-001",
      songFilePath: "/tmp/old.mp3",
      albums: [oldAlbum],
      createdAt: "2024",
      mediaFiles: [],
      save: jest.fn(),
    };
    mockSongFindById.mockReturnValue({ populate: jest.fn().mockResolvedValue(songInDb) });
    mockExistsSync.mockReturnValue(true);
    mockUnlink.mockImplementation((_path, callback) => callback(null));
    const req = {
      params: { id: "song-001" },
      body: {
        id: "song-001",
        title: "Updated",
        lyrics: "Updated lyrics",
        chord: "G",
        tempo: 100,
        rythm: "3/4",
        albums: [newAlbum],
      },
      file: { path: "/tmp/new.mp3" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateSong(req, res);

    expect(mockUnlink).toHaveBeenCalledWith("/tmp/old.mp3", expect.any(Function));
    expect(oldAlbum.songs).toEqual([]);
    expect(newAlbum.songs).toEqual(["song-001"]);
    expect(songInDb.songFilePath).toBe("/tmp/new.mp3");
    expect(songInDb.save).toHaveBeenCalledTimes(1);
  });

  it("should recreate the song when the id changes during update", async () => {
    const songInDb = {
      _id: "song-001",
      songFilePath: null,
      albums: [],
      createdAt: "2024",
      lyrics: "lyrics",
      mediaFiles: [],
      musicElements: { chord: "C", tempo: 120, rythm: "4/4" },
      title: "Old",
      save: jest.fn(),
    };
    mockSongFindById.mockReturnValue({ populate: jest.fn().mockResolvedValue(songInDb) });
    const req = {
      params: { id: "song-001" },
      body: {
        id: "song-002",
        title: "Updated",
        lyrics: "Updated lyrics",
        chord: "G",
        tempo: 100,
        rythm: "3/4",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateSong(req, res);

    expect(mockSongFindByIdAndDelete).toHaveBeenCalledWith("song-001");
    expect(mockSongCreate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "song-002", title: "Updated" }),
    );
    expect(songInDb.save).not.toHaveBeenCalled();
  });

  it("should update the audio file when patching a song", async () => {
    const songInDb = {
      songFilePath: "/tmp/old.mp3",
      save: jest.fn(),
    };
    mockSongFindById.mockResolvedValue(songInDb);
    mockExistsSync.mockReturnValue(true);
    mockUnlink.mockImplementation((_path, callback) => callback(null));
    const req = {
      params: { id: "song-001" },
      body: { "video-link": "https://youtu.be/test" },
      file: { path: "/tmp/new.mp3" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await patchSong(req, res);

    expect(mockUnlink).toHaveBeenCalledWith("/tmp/old.mp3", expect.any(Function));
    expect(songInDb.songFilePath).toBe("/tmp/new.mp3");
    expect(songInDb.youtubeLink).toBe("https://youtu.be/test");
    expect(songInDb.save).toHaveBeenCalledTimes(1);
  });

  it("should remove a deleted song from all albums", async () => {
    const album = { songs: ["song-001", "song-002"], save: jest.fn() };
    mockSongFindById.mockResolvedValue({ albums: ["album-001"] });
    mockAlbumFindById.mockResolvedValue(album);
    const req = { params: { id: "song-001" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await deleteSong(req, res);

    expect(album.songs).toEqual(["song-002"]);
    expect(album.save).toHaveBeenCalledTimes(1);
    expect(mockSongFindByIdAndDelete).toHaveBeenCalledWith("song-001");
  });

  it("should throw when trying to delete a missing song", async () => {
    mockSongFindById.mockResolvedValue(null);

    await expect(deleteSong({ params: { id: "song-001" } }, {})).rejects.toThrow(NotFoundError);
  });

  it("should throw when the stored audio file is missing", async () => {
    mockSongFindById.mockResolvedValue({ songFilePath: "/tmp/missing.mp3" });
    mockExistsSync.mockReturnValue(false);

    await expect(
      streamSongAudio({ params: { id: "song-001" }, headers: {} }, {}),
    ).rejects.toThrow(ServerFaultError);
  });

  it("should return 416 for invalid range requests", async () => {
    mockSongFindById.mockResolvedValue({ songFilePath: "/tmp/song.mp3" });
    mockExistsSync.mockReturnValue(true);
    mockStatSync.mockReturnValue({ size: 100 });
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    await streamSongAudio({ params: { id: "song-001" }, headers: { range: "bytes=500-600" } }, res);

    expect(res.writeHead).toHaveBeenCalledWith(416, { "Content-Range": "bytes */100" });
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  it("should return all songs when the all flag is provided", async () => {
    SongModel.find = jest.fn().mockResolvedValue([
      { _doc: { _id: "song-001", title: "Song 1", songFilePath: "/tmp/a.mp3" }, songFilePath: "/tmp/a.mp3" },
      { _doc: { _id: "song-002", title: "Song 2", songFilePath: null }, songFilePath: null },
    ]);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllOrSearchSongs({ query: { all: true } }, res);

    expect(SongModel.find).toHaveBeenCalledWith();
    expect(res.json).toHaveBeenCalledWith({
      songs: [
        { _id: "song-001", title: "Song 1", hasAudio: true, songFilePath: undefined },
        { _id: "song-002", title: "Song 2", hasAudio: false, songFilePath: undefined },
      ],
      totalPages: undefined,
    });
  });

  it("should stream the first audio chunk when no range header is present", async () => {
    const pipe = jest.fn();
    mockSongFindById.mockResolvedValue({ songFilePath: "/tmp/song.mp3" });
    mockExistsSync.mockReturnValue(true);
    mockStatSync.mockReturnValue({ size: 1000 });
    mockCreateReadStream.mockReturnValue({ pipe });
    const res = { writeHead: jest.fn() };

    await streamSongAudio({ params: { id: "song-001" }, headers: {} }, res);

    expect(res.writeHead).toHaveBeenCalledWith(206, {
      "Content-Range": "bytes 0-999/1000",
      "Accept-Ranges": "bytes",
      "Content-Length": 1000,
      "Content-Type": "audio/mpeg",
    });
    expect(mockCreateReadStream).toHaveBeenCalledWith("/tmp/song.mp3", { start: 0, end: 999 });
    expect(pipe).toHaveBeenCalledWith(res);
  });

  it("should stream a valid requested range", async () => {
    const pipe = jest.fn();
    mockSongFindById.mockResolvedValue({ songFilePath: "/tmp/song.mp3" });
    mockExistsSync.mockReturnValue(true);
    mockStatSync.mockReturnValue({ size: 1000 });
    mockCreateReadStream.mockReturnValue({ pipe });
    const res = { writeHead: jest.fn() };

    await streamSongAudio({ params: { id: "song-001" }, headers: { range: "bytes=100-199" } }, res);

    expect(res.writeHead).toHaveBeenCalledWith(206, {
      "Content-Range": "bytes 100-199/1000",
      "Accept-Ranges": "bytes",
      "Content-Length": 100,
      "Content-Type": "audio/mpeg",
    });
    expect(mockCreateReadStream).toHaveBeenCalledWith("/tmp/song.mp3", { start: 100, end: 199 });
    expect(pipe).toHaveBeenCalledWith(res);
  });

  it("should capture file delete errors when patching a song", async () => {
    const songInDb = {
      songFilePath: "/tmp/old.mp3",
      save: jest.fn(),
    };
    mockSongFindById.mockResolvedValue(songInDb);
    mockExistsSync.mockReturnValue(true);
    mockUnlink.mockImplementation((_path, callback) => callback(new Error("unlink failed")));
    const req = {
      params: { id: "song-001" },
      body: { "video-link": "https://youtu.be/test" },
      file: { path: "/tmp/new.mp3" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await patchSong(req, res);

    expect(req.error.fileDeleteError).toBeInstanceOf(Error);
    expect(songInDb.save).toHaveBeenCalledTimes(1);
  });
});
