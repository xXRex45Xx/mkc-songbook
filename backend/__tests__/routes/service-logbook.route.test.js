import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

import app from "../../index.js";
import LogBookModel from "../../models/service-logbook.model.js";
import {
  authHeader,
  createSong,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("service logbook routes", () => {
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

  describe("GET /api/logbook", () => {
    it("should return logbook entries to an authenticated member", async () => {
      await seedAuthUsers();
      await LogBookModel.create({
        churchName: "Saint Mark",
        serviceDate: new Date("2099-01-01T10:00:00.000Z"),
        songList: ["song-001"],
      });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get("/api/logbook")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.logBook).toHaveLength(1);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.logBook[0].songList).toBeUndefined();
    });

    it("should reject anonymous requests", async () => {
      const response = await request(app).get("/api/logbook");

      expect(response.status).toBe(401);
    });

    it("should search by location", async () => {
      await seedAuthUsers();
      await LogBookModel.create({
        churchName: "Saint Mark",
        serviceDate: new Date("2099-01-01T10:00:00.000Z"),
        songList: ["song-001"],
      });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get("/api/logbook?q=Mark&type=location")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.logBook).toHaveLength(1);
    });

    it("should reject invalid query pairs", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get("/api/logbook?q=Mark")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/logbook", () => {
    it("should allow an admin to create a logbook entry", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .post("/api/logbook")
        .set(authHeader(loginResponse.body.token))
        .send({
          location: "Saint Mark",
          timestamp: "2099-01-01T10:00:00.000Z",
          songs: ["song-001"],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("inseretedLog");
      expect(await LogBookModel.findById(response.body.inseretedLog)).toBeTruthy();
    });

    it("should reject logbook creation for a member", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .post("/api/logbook")
        .set(authHeader(loginResponse.body.token))
        .send({
          location: "Saint Mark",
          timestamp: "2099-01-01T10:00:00.000Z",
          songs: ["song-001"],
        });

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /api/logbook/:id", () => {
    it("should create a new log entry instead of updating the existing one", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const existing = await LogBookModel.create({
        churchName: "Old Church",
        serviceDate: new Date("2099-01-01T10:00:00.000Z"),
        songList: ["song-001"],
      });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .put(`/api/logbook/${existing._id}`)
        .set(authHeader(loginResponse.body.token))
        .send({
          location: "Updated Church",
          timestamp: "2099-02-01T10:00:00.000Z",
          songs: ["song-001"],
        });

      const entries = await LogBookModel.find({});

      expect(response.status).toBe(201);
      expect(entries).toHaveLength(2);
      expect(entries.some((entry) => entry.churchName === "Old Church")).toBe(true);
      expect(entries.some((entry) => entry.churchName === "Updated Church")).toBe(true);
    });
  });
});
