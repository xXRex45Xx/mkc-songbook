import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";

import app from "../../index.js";
import OTPModel from "../../models/otp.model.js";
import {
  createOtp,
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

const verify = (otp) =>
  request(app).post("/api/user/verify-otp").send({ email: "fresh@example.com", otp });

describe("otp attempt limit", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("should delete the code after five wrong guesses so the right one fails too", async () => {
    await createOtp({ email: "fresh@example.com", otp: 555555 });

    for (let i = 0; i < 5; i++) expect((await verify(111111)).status).toBe(400);

    expect(await OTPModel.findOne({ email: "fresh@example.com" })).toBeNull();
    expect((await verify(555555)).status).toBe(400);
  });

  it("should keep the wrong guesses already made when a new code is requested", async () => {
    await createOtp({ email: "fresh@example.com", otp: 555555 });
    for (let i = 0; i < 4; i++) await verify(111111);

    await request(app).post("/api/user/otp").send({ email: "fresh@example.com" });
    await OTPModel.updateOne({ email: "fresh@example.com" }, { otp: 555555 });
    await verify(111111);

    expect(await OTPModel.findOne({ email: "fresh@example.com" })).toBeNull();
  });

  it("should refuse a new code after ten wrong guesses within the hour", async () => {
    for (let round = 0; round < 2; round++) {
      expect(
        (await request(app).post("/api/user/otp").send({ email: "fresh@example.com" })).status
      ).toBe(200);
      await OTPModel.updateOne({ email: "fresh@example.com" }, { otp: 555555 });
      for (let i = 0; i < 5; i++) expect((await verify(111111)).status).toBe(400);
    }

    const response = await request(app)
      .post("/api/user/otp")
      .send({ email: "fresh@example.com" });

    expect(response.status).toBe(429);
  });
});
