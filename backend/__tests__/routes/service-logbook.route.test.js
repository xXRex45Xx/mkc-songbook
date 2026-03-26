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

    it("should search by service date", async () => {
      await seedAuthUsers();
      await LogBookModel.create({
        churchName: "Saint Mark",
        serviceDate: new Date("2099-01-01T10:00:00.000Z"),
        songList: ["song-001"],
      });
      await LogBookModel.create({
        churchName: "Saint John",
        serviceDate: new Date("2099-02-01T10:00:00.000Z"),
        songList: ["song-001"],
      });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get("/api/logbook?q=2099-01-01T10:00:00.000Z&type=date")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.logBook).toHaveLength(1);
      expect(response.body.logBook[0].churchName).toBe("Saint Mark");
    });

    it("should paginate logbook entries", async () => {
      await seedAuthUsers();
      await LogBookModel.insertMany(
        Array.from({ length: 101 }, (_, index) => ({
          churchName: `Church ${index}`,
          serviceDate: new Date(`2099-01-${String((index % 28) + 1).padStart(2, "0")}T10:00:00.000Z`),
          songList: ["song-001"],
        })),
      );
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get("/api/logbook?page=2")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.totalPages).toBe(2);
      expect(response.body.logBook).toHaveLength(1);
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

    it("should reject unauthenticated logbook creation", async () => {
      const response = await request(app)
        .post("/api/logbook")
        .send({
          location: "Saint Mark",
          timestamp: "2099-01-01T10:00:00.000Z",
          songs: ["song-001"],
        });

      expect(response.status).toBe(401);
    });

    it("should reject missing referenced songs", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .post("/api/logbook")
        .set(authHeader(loginResponse.body.token))
        .send({
          location: "Saint Mark",
          timestamp: "2099-01-01T10:00:00.000Z",
          songs: ["song-404"],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("The following songs don't exist: song-404");
    });
  });

  describe("PUT /api/logbook/:id", () => {
    it("should return 404 because the update route is not registered", async () => {
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

      expect(response.status).toBe(404);
      expect(await LogBookModel.countDocuments()).toBe(1);
    });
  });
});
