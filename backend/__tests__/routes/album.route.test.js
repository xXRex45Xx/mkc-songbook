import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

import app from "../../index.js";
import AlbumModel from "../../models/album.model.js";
import SongModel from "../../models/song.model.js";
import {
  authHeader,
  createAlbum,
  createSong,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("album routes", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  describe("GET /api/album", () => {
    it("should return all albums", async () => {
      await createAlbum({ _id: "album-001", name: "Classic Hymns", songs: ["song-001", "song-002"] });
      await createAlbum({ _id: "album-002", name: "Worship Songs", songs: [] });

      const response = await request(app).get("/api/album");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("numOfSongs");
      expect(response.body[0].songs).toBeUndefined();
      expect(response.body[0].photoPath).toBeUndefined();
    });

    it("should return album names only when names=true", async () => {
      await createAlbum({ _id: "album-001", name: "Classic Hymns" });

      const response = await request(app).get("/api/album?names=true");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: "Classic Hymns" })]),
      );
    });

    it("should reject an invalid names query", async () => {
      const response = await request(app).get("/api/album?names=not-a-boolean");

      expect(response.status).toBe(400);
    });

    it("should search albums by query", async () => {
      await createAlbum({ _id: "album-001", name: "Classic Hymns" });
      await createAlbum({ _id: "album-002", name: "Modern Worship" });

      const response = await request(app).get("/api/album?q=Classic");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe("Classic Hymns");
    });
  });

  describe("GET /api/album/:id", () => {
    it("should return a single album", async () => {
      await createSong({ _id: "song-001", title: "Amazing Grace", songFilePath: "/tmp/a.mp3" });
      await createAlbum({ _id: "album-001", name: "Classic Hymns", songs: ["song-001"] });

      const response = await request(app).get("/api/album/album-001");

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Classic Hymns");
      expect(response.body.photoPath).toBeUndefined();
      expect(response.body.songs[0].hasAudio).toBe(true);
    });

    it("should return 404 when the album does not exist", async () => {
      const response = await request(app).get("/api/album/missing-album");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Album not found");
    });
  });

  describe("POST /api/album", () => {
    it("should allow an admin to create an album", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", albums: [] });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .post("/api/album")
        .set(authHeader(loginResponse.body.token))
        .send({ id: "album-001", title: "Classic Hymns", songs: ["song-001"] });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ insertedId: "album-001" });
      expect(await AlbumModel.findById("album-001")).toBeTruthy();
      expect((await SongModel.findById("song-001")).albums).toContain("album-001");
    });

    it("should reject non-admin album creation", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", albums: [] });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .post("/api/album")
        .set(authHeader(loginResponse.body.token))
        .send({ id: "album-001", title: "Classic Hymns", songs: ["song-001"] });

      expect(response.status).toBe(403);
    });

    it("should reject unauthenticated album creation", async () => {
      const response = await request(app)
        .post("/api/album")
        .send({ id: "album-001", title: "Classic Hymns", songs: ["song-001"] });

      expect(response.status).toBe(401);
    });

    it("should reject duplicate album ids", async () => {
      await seedAuthUsers();
      await createAlbum({ _id: "album-001" });
      await createSong({ _id: "song-001", albums: [] });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .post("/api/album")
        .set(authHeader(loginResponse.body.token))
        .send({ id: "album-001", title: "Classic Hymns", songs: ["song-001"] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Album with id album-001 already exists.");
    });

    it("should reject missing referenced songs", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .post("/api/album")
        .set(authHeader(loginResponse.body.token))
        .send({ id: "album-001", title: "Classic Hymns", songs: ["song-404"] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("The following songs don't exist: song-404");
    });
  });

  describe("PUT /api/album/:id", () => {
    it("should update an existing album", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", albums: ["album-001"] });
      await createSong({ _id: "song-002", albums: [] });
      await createAlbum({ _id: "album-001", name: "Classic Hymns", songs: ["song-001"] });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .put("/api/album/album-001")
        .set(authHeader(loginResponse.body.token))
        .send({ id: "album-001", title: "Updated Hymns", songs: ["song-002"] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ updated: true });
      expect((await AlbumModel.findById("album-001")).name).toBe("Updated Hymns");
      expect((await SongModel.findById("song-001")).albums).not.toContain("album-001");
      expect((await SongModel.findById("song-002")).albums).toContain("album-001");
    });

    it("should return 404 when updating a missing album", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", albums: [] });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .put("/api/album/missing-album")
        .set(authHeader(loginResponse.body.token))
        .send({ id: "missing-album", title: "Updated Hymns", songs: ["song-001"] });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Album with id missing-album does not exist.");
    });

    it("should support changing the album id", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", albums: ["album-001"] });
      await createAlbum({ _id: "album-001", name: "Classic Hymns", songs: ["song-001"] });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .put("/api/album/album-001")
        .set(authHeader(loginResponse.body.token))
        .send({ id: "album-002", title: "Updated Hymns", songs: ["song-001"] });

      expect(response.status).toBe(200);
      expect(await AlbumModel.findById("album-001")).toBeNull();
      expect(await AlbumModel.findById("album-002")).toBeTruthy();
      expect((await SongModel.findById("song-001")).albums).toContain("album-002");
    });

    it("should reject changing the album id to one that already exists", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", albums: ["album-001"] });
      await createAlbum({ _id: "album-001", songs: ["song-001"] });
      await createAlbum({ _id: "album-002", songs: [] });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .put("/api/album/album-001")
        .set(authHeader(loginResponse.body.token))
        .send({ id: "album-002", title: "Updated Hymns", songs: ["song-001"] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Album with id album-002 already exists.");
    });
  });

  describe("DELETE /api/album/:id", () => {
    it("should delete an existing album", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", albums: ["album-001"] });
      await createAlbum({ _id: "album-001", songs: ["song-001"] });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .delete("/api/album/album-001")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ deleted: true });
      expect(await AlbumModel.findById("album-001")).toBeNull();
      expect((await SongModel.findById("song-001")).albums).not.toContain("album-001");
    });

    it("should return 404 when deleting a missing album", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .delete("/api/album/missing-album")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Album doesn't exist.");
    });
  });
});
