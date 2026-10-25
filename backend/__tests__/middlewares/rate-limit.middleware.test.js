import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";

import {
  authEmailLimiter,
  authIpLimiter,
  otpRequestLimiter,
} from "../../middlewares/rate-limit.middleware.js";

const buildApp = (limiter) => {
  const app = express();
  app.use(express.json());
  app.post("/guess", limiter, (req, res) => res.status(401).json({ message: "wrong guess" }));
  return app;
};

describe("rate limit middleware", () => {
  beforeAll(() => {
    process.env.RATE_LIMIT_IN_TEST = "on";
  });

  afterAll(() => {
    delete process.env.RATE_LIMIT_IN_TEST;
  });

  it("should answer 429 once an email exceeds its attempt budget", async () => {
    const app = buildApp(authEmailLimiter);

    for (let i = 0; i < 10; i++) {
      const ok = await request(app).post("/guess").send({ email: "Victim@Example.com" });
      expect(ok.status).toBe(401);
    }
    const blocked = await request(app).post("/guess").send({ email: "victim@example.com" });

    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toBe("Too many attempts. Please, try again later.");
  });

  it("should not spend the budget on successful requests", async () => {
    const app = express();
    app.use(express.json());
    app.post("/ok", authEmailLimiter, (req, res) => res.json({ success: true }));

    for (let i = 0; i < 12; i++) {
      const ok = await request(app).post("/ok").send({ email: "fine@example.com" });
      expect(ok.status).toBe(200);
    }
  });

  it("should keep a separate budget for each email", async () => {
    const app = buildApp(otpRequestLimiter);

    for (let i = 0; i < 5; i++) await request(app).post("/guess").send({ email: "a@example.com" });
    const other = await request(app).post("/guess").send({ email: "b@example.com" });

    expect(other.status).toBe(401);
  });

  it("should answer 429 once an address exceeds its request budget", async () => {
    const app = buildApp(authIpLimiter);

    for (let i = 0; i < 30; i++) await request(app).post("/guess").send({});
    const blocked = await request(app).post("/guess").send({});

    expect(blocked.status).toBe(429);
  });
});
