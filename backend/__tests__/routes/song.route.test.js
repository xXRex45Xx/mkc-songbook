import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs/promises";
import os from "os";
import path from "path";
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

  describe("PATCH /api/song/:id", () => {
    it("should reject unauthenticated patch requests", async () => {
      const response = await request(app)
        .patch("/api/song/song-001")
        .send({ "video-link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });

      expect(response.status).toBe(401);
    });

    it("should reject non-admin patch requests", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .patch("/api/song/song-001")
        .set(authHeader(loginResponse.body.token))
        .send({ "video-link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });

      expect(response.status).toBe(403);
    });

    it("should update a song video link for an admin", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001", youtubeLink: null });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .patch("/api/song/song-001")
        .set(authHeader(loginResponse.body.token))
        .send({ "video-link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ updated: true });
      expect((await SongModel.findById("song-001")).youtubeLink).toBe(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );
    });

    it("should reject patch requests with an invalid video link", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .patch("/api/song/song-001")
        .set(authHeader(loginResponse.body.token))
        .send({ "video-link": "not-a-url" });

      expect(response.status).toBe(400);
    });

    it("should return 404 when patching a missing song", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .patch("/api/song/missing-song")
        .set(authHeader(loginResponse.body.token))
        .send({ "video-link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Song not found.");
    });
  });

  describe("GET /api/song/:id/audio", () => {
    it("should stream audio for a song with an audio file", async () => {
      const audioPath = path.join(os.tmpdir(), `song-route-${Date.now()}.mp3`);
      await fs.writeFile(audioPath, Buffer.from("fake-audio-data"));
      await createSong({ _id: "song-001", songFilePath: audioPath });

      const response = await request(app).get("/api/song/song-001/audio");

      expect(response.status).toBe(206);
      expect(response.headers["accept-ranges"]).toBe("bytes");
      expect(response.headers["content-type"]).toContain("audio/mpeg");

      await fs.unlink(audioPath);
    });

    it("should return 404 when the song has no audio file", async () => {
      await createSong({ _id: "song-001", songFilePath: null });

      const response = await request(app).get("/api/song/song-001/audio");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Song does not have an audio file.");
    });
  });
});
