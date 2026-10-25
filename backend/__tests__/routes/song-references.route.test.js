import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs/promises";
import os from "os";
import path from "path";
import request from "supertest";

import app from "../../index.js";
import AlbumModel from "../../models/album.model.js";
import LogBookModel from "../../models/service-logbook.model.js";
import PlaylistModel from "../../models/playlist.model.js";
import SongModel from "../../models/song.model.js";
import UserModel from "../../models/user.model.js";
import {
  authHeader,
  createAlbum,
  createPlaylist,
  createSong,
  createUser,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

const OLD_DATE = new Date("2020-01-01T00:00:00.000Z");

const adminToken = async () => {
  await seedAuthUsers();
  const login = await loginUser("admin-route@mkc.com", "admin123");
  return login.body.token;
};

const fileGone = async (file) => {
  for (let i = 0; i < 50; i++) {
    try {
      await fs.access(file);
    } catch {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  return false;
};

describe("song references", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  const seedReferences = async (songId) => {
    const member = await createUser({ email: "fan@example.com", favorites: [songId, "other"] });
    await createAlbum({ _id: "album-001", songs: [songId, "other"] });
    await createSong({ _id: "other" });
    await PlaylistModel.deleteMany({});
    await createPlaylist({ creator: member._id, songs: [songId, "other"], updatedAt: OLD_DATE });
    await LogBookModel.create({
      churchName: "Saint Mark",
      serviceDate: new Date("2099-01-01T10:00:00.000Z"),
      songList: [songId, "other"],
      updatedAt: OLD_DATE,
    });
  };

  describe("DELETE /api/song/:id", () => {
    it("should remove the id from playlists, favorites and logbooks and delete the audio file", async () => {
      const token = await adminToken();
      const audio = path.join(await fs.mkdtemp(path.join(os.tmpdir(), "song-")), "a.mp3");
      await fs.writeFile(audio, "audio");
      await createSong({ _id: "song-001", albums: ["album-001"], songFilePath: audio });
      await seedReferences("song-001");

      const response = await request(app).delete("/api/song/song-001").set(authHeader(token));

      expect(response.status).toBe(200);
      expect((await AlbumModel.findById("album-001")).songs).toEqual(["other"]);
      const playlist = await PlaylistModel.findOne();
      expect(playlist.songs).toEqual(["other"]);
      expect(playlist.updatedAt.getTime()).toBeGreaterThan(OLD_DATE.getTime());
      const logbook = await LogBookModel.findOne();
      expect(logbook.songList).toEqual(["other"]);
      expect(logbook.updatedAt.getTime()).toBeGreaterThan(OLD_DATE.getTime());
      expect((await UserModel.findOne({ email: "fan@example.com" })).favorites).toEqual(["other"]);
      expect(await fileGone(audio)).toBe(true);
    });
  });

  describe("PUT /api/song/:id with a new id", () => {
    it("should keep the audio path and video link and repoint every reference", async () => {
      const token = await adminToken();
      await createSong({
        _id: "song-001",
        albums: ["album-001"],
        songFilePath: "/tmp/keep.mp3",
        youtubeLink: "https://youtu.be/abcdefghijk",
      });
      await seedReferences("song-001");

      const response = await request(app)
        .put("/api/song/song-001")
        .set(authHeader(token))
        .send({
          id: "song-002",
          title: "Renamed",
          lyrics: "lyrics",
          chord: "G",
          tempo: 95,
          rythm: "3/4",
          "video-link": "https://youtu.be/abcdefghijk",
        });

      expect(response.body).toEqual({ updated: true });
      expect(await SongModel.findById("song-001")).toBeNull();
      const renamed = await SongModel.findById("song-002");
      expect(renamed.songFilePath).toBe("/tmp/keep.mp3");
      expect(renamed.youtubeLink).toBe("https://youtu.be/abcdefghijk");
      expect(renamed.albums).toEqual(["album-001"]);
      expect((await AlbumModel.findById("album-001")).songs).toEqual(["song-002", "other"]);
      expect((await PlaylistModel.findOne()).songs).toEqual(["song-002", "other"]);
      expect((await LogBookModel.findOne()).songList).toEqual(["song-002", "other"]);
      expect((await UserModel.findOne({ email: "fan@example.com" })).favorites).toEqual(["song-002", "other"]);
    });

    it("should keep the old song when the new id is already taken", async () => {
      const token = await adminToken();
      await createSong({ _id: "song-001", songFilePath: "/tmp/keep.mp3" });
      await createSong({ _id: "song-002" });

      const response = await request(app)
        .put("/api/song/song-001")
        .set(authHeader(token))
        .send({ id: "song-002", title: "Title", lyrics: "Lyrics", chord: "G", tempo: 95, rythm: "3/4" });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect((await SongModel.findById("song-001")).songFilePath).toBe("/tmp/keep.mp3");
    });
  });

  describe("song-album link sync", () => {
    it("should bump Album.updatedAt when a song is added to albums", async () => {
      const token = await adminToken();
      await createAlbum({ _id: "album-001" });
      await AlbumModel.updateOne({ _id: "album-001" }, { updatedAt: OLD_DATE });

      const response = await request(app)
        .post("/api/song")
        .set(authHeader(token))
        .send({ id: "song-100", title: "Title", lyrics: "Lyrics", chord: "C", tempo: 110, rythm: "4/4", albums: "album-001" });

      expect(response.body).toEqual({ insertedId: "song-100" });
      const album = await AlbumModel.findById("album-001");
      expect(album.songs).toContain("song-100");
      expect(album.updatedAt.getTime()).toBeGreaterThan(OLD_DATE.getTime());
    });

    it("should bump Song.updatedAt when an album is added with songs", async () => {
      const token = await adminToken();
      await createSong({ _id: "song-001", updatedAt: OLD_DATE });

      const response = await request(app)
        .post("/api/album")
        .set(authHeader(token))
        .send({ id: "album-001", title: "Hymns", songs: ["song-001"] });

      expect(response.status).toBe(201);
      const song = await SongModel.findById("song-001");
      expect(song.albums).toContain("album-001");
      expect(song.updatedAt.getTime()).toBeGreaterThan(OLD_DATE.getTime());
    });
  });
});
