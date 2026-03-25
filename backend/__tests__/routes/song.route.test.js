import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

import app from "../../index.js";
import SongModel from "../../models/song.model.js";
import {
  authHeader,
  createSong,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("song routes", () => {
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

  describe("GET /api/song", () => {
    it("should return all songs when no query is provided", async () => {
      await createSong({ _id: "song-001", title: "Amazing Grace", songFilePath: "/tmp/a.mp3" });
      await createSong({ _id: "song-002", title: "It Is Well", songFilePath: null });

      const response = await request(app).get("/api/song");

      expect(response.status).toBe(200);
      expect(response.body.songs).toHaveLength(2);
      expect(response.body.songs[0]).toHaveProperty("hasAudio");
      expect(response.body.songs[0].songFilePath).toBeUndefined();
    });

    it("should search by title", async () => {
      await createSong({ _id: "song-001", title: "Amazing Grace" });
      await createSong({ _id: "song-002", title: "It Is Well" });

      const response = await request(app).get("/api/song?q=Amazing&type=title");

      expect(response.status).toBe(200);
      expect(response.body.songs).toHaveLength(1);
      expect(response.body.songs[0].title).toBe("Amazing Grace");
    });

    it("should reject invalid query combinations", async () => {
      const response = await request(app).get("/api/song?q=Amazing");

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/contains \[q\] without its required peers \[type\]/);
    });
  });

  describe("GET /api/song/:id", () => {
    it("should return a single song", async () => {
      await createSong({ _id: "song-001", title: "Amazing Grace", songFilePath: "/tmp/a.mp3" });

      const response = await request(app).get("/api/song/song-001");

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Amazing Grace");
      expect(response.body.hasAudio).toBe(true);
      expect(response.body.songFilePath).toBeUndefined();
    });

    it("should return 404 when the song does not exist", async () => {
      const response = await request(app).get("/api/song/missing-song");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Song not found");
    });
  });

  describe("POST /api/song", () => {
    it("should allow an admin to create a song", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .post("/api/song")
        .set(authHeader(loginResponse.body.token))
        .send({
          id: "song-100",
          title: "Route Song",
          lyrics: "Route song lyrics",
          chord: "C",
          tempo: 110,
          rythm: "4/4",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ insertedId: "song-100" });
      expect(await SongModel.findById("song-100")).toBeTruthy();
    });

    it("should reject non-admin song creation", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .post("/api/song")
        .set(authHeader(loginResponse.body.token))
        .send({
          id: "song-100",
          title: "Route Song",
          lyrics: "Route song lyrics",
          chord: "C",
          tempo: 110,
          rythm: "4/4",
        });

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /api/song/:id", () => {
    it("should update an existing song", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", title: "Old Title" });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .put("/api/song/song-001")
        .set(authHeader(loginResponse.body.token))
        .send({
          id: "song-001",
          title: "New Title",
          lyrics: "Updated lyrics",
          chord: "G",
          tempo: 95,
          rythm: "3/4",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ updated: true });
      expect((await SongModel.findById("song-001")).title).toBe("New Title");
    });

    it("should support changing the song id", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", title: "Old Title" });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .put("/api/song/song-001")
        .set(authHeader(loginResponse.body.token))
        .send({
          id: "song-002",
          title: "Migrated Title",
          lyrics: "Updated lyrics",
          chord: "G",
          tempo: 95,
          rythm: "3/4",
        });

      expect(response.status).toBe(200);
      expect(await SongModel.findById("song-001")).toBeNull();
      expect(await SongModel.findById("song-002")).toBeTruthy();
    });

    it("should return 404 when updating a missing song", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .put("/api/song/missing-song")
        .set(authHeader(loginResponse.body.token))
        .send({
          id: "missing-song",
          title: "Missing",
          lyrics: "Updated lyrics",
          chord: "G",
          tempo: 95,
          rythm: "3/4",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Song not found");
    });
  });

  describe("DELETE /api/song/:id", () => {
    it("should delete an existing song", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .delete("/api/song/song-001")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ deleted: true });
      expect(await SongModel.findById("song-001")).toBeNull();
    });

    it("should return 404 when deleting a missing song", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .delete("/api/song/missing-song")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Song doesn't exist.");
    });
  });

  describe("unwired song routes", () => {
    it("should return 404 for PATCH /api/song/:id because the route is not registered", async () => {
      const response = await request(app).patch("/api/song/song-001").send({ "video-link": "" });

      expect(response.status).toBe(404);
    });
  });
});
