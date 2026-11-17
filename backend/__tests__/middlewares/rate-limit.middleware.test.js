import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";

import {
  audioRateLimiter,
  apiRateLimiter,
  createRateLimiter,
  isAudioRequest,
  isLoginRequest,
} from "../../middlewares/rate-limit.middleware.js";

describe("rate limit middleware", () => {
  beforeAll(() => {
    process.env.RATE_LIMIT_IN_TEST = "on";
  });

  afterAll(() => {
    delete process.env.RATE_LIMIT_IN_TEST;
  });

  it("should answer 429 once an address exceeds its request budget", async () => {
    const app = express();
    app.get("/ping", createRateLimiter(3), (req, res) => res.json({ ok: true }));

    for (let i = 0; i < 3; i++) {
      expect((await request(app).get("/ping")).status).toBe(200);
    }
    const blocked = await request(app).get("/ping");

    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toBe("Too many requests. Please, try again later.");
  });

  it("should not count requests the limiter does not apply to", async () => {
    const app = express();
    app.get("/a", createRateLimiter(1, (req) => req.path === "/a"), (req, res) => res.json({}));
    app.get("/b", createRateLimiter(1, (req) => req.path === "/a"), (req, res) => res.json({}));

    for (let i = 0; i < 3; i++) expect((await request(app).get("/b")).status).toBe(200);
  });

  describe("login requests", () => {
    it.each([
      ["POST", "/user/login", true],
      ["GET", "/user/login", false],
      ["POST", "/user/otp", false],
      ["POST", "/user/login/extra", false],
    ])("%s %s should be login: %s", (method, path, expected) => {
      expect(isLoginRequest({ method, path })).toBe(expected);
    });

    it("should answer a throttled login like a wrong password, without Retry-After", async () => {
      const app = express();
      app.use("/api", createRateLimiter(1), (req, res) => res.json({}));

      await request(app).post("/api/user/login");
      const throttled = await request(app).post("/api/user/login");

      expect(throttled.status).toBe(400);
      expect(throttled.body).toEqual({ message: "Invalid username or password." });
      expect(throttled.headers["retry-after"]).toBeUndefined();
    });

    it("should send no rate-limit headers on any login answer, throttled or not", async () => {
      const app = express();
      app.use("/api", createRateLimiter(1), (req, res) => res.status(400).json({}));

      const first = await request(app).post("/api/user/login");
      const throttled = await request(app).post("/api/user/login");

      for (const response of [first, throttled]) {
        expect(response.headers["ratelimit"]).toBeUndefined();
        expect(response.headers["ratelimit-policy"]).toBeUndefined();
        expect(response.headers["retry-after"]).toBeUndefined();
      }
    });

    it("should keep rate-limit headers on other routes", async () => {
      const app = express();
      app.use("/api", createRateLimiter(5), (req, res) => res.json({}));

      const response = await request(app).get("/api/song");

      expect(response.headers["ratelimit"]).toContain("5-in-15min");
    });

    it("should still answer 429 to other throttled requests", async () => {
      const app = express();
      app.use("/api", createRateLimiter(1), (req, res) => res.json({}));

      await request(app).post("/api/user/otp");
      const throttled = await request(app).post("/api/user/otp");

      expect(throttled.status).toBe(429);
    });
  });

  describe("audio requests", () => {
    it.each([
      ["GET", "/song/abc/audio", true],
      ["HEAD", "/song/abc/audio", true],
      ["POST", "/song/abc/audio", false],
      ["GET", "/song/abc", false],
      ["GET", "/song/abc/audio/extra", false],
      ["GET", "/user/login", false],
    ])("%s %s should be audio: %s", (method, path, expected) => {
      expect(isAudioRequest({ method, path })).toBe(expected);
    });

    it("should count audio only on the audio limiter, and everything else only on the generic one", async () => {
      const app = express();
      app.use("/api", apiRateLimiter, audioRateLimiter, (req, res) => res.json({}));

      // Sending past the default caps would be slow; the reported policy shows which limiter counted.
      const audio = await request(app).get("/api/song/abc/audio");
      const other = await request(app).get("/api/song");

      expect(audio.headers["ratelimit"]).toContain("6000-in-15min");
      expect(other.headers["ratelimit"]).toContain("600-in-15min");
    });
  });
});
