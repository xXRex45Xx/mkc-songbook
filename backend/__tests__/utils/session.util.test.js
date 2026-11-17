import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import RefreshTokenModel from "../../models/refresh-token.model.js";
import {
  ensureDbConnection,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";
import { clearSessionCookies, issueSession } from "../../utils/session.util.js";

const buildRes = () => ({ cookie: jest.fn(), clearCookie: jest.fn() });

const optionsFor = (res, name) => res.cookie.mock.calls.find(([cookie]) => cookie === name)[2];

describe("session util", () => {
  let user;
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
    user = (await seedAuthUsers()).memberUser;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("should set both cookies HttpOnly, Lax and scoped, not Secure outside production", async () => {
    const res = buildRes();

    await issueSession(res, user);

    expect(optionsFor(res, "mkc_at")).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/api",
      maxAge: 15 * 60 * 1000,
    });
    expect(optionsFor(res, "mkc_rt")).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/api/user/session",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  });

  it("should mark both cookies Secure in production", async () => {
    process.env.NODE_ENV = "production";
    const res = buildRes();

    await issueSession(res, user);

    expect(optionsFor(res, "mkc_at").secure).toBe(true);
    expect(optionsFor(res, "mkc_rt").secure).toBe(true);
  });

  it("should read the lifetimes from the environment", async () => {
    process.env.ACCESS_TOKEN_TTL_MINUTES = "5";
    process.env.REFRESH_TOKEN_TTL_DAYS = "7";
    const res = buildRes();

    await issueSession(res, user);

    expect(optionsFor(res, "mkc_at").maxAge).toBe(5 * 60 * 1000);
    expect(optionsFor(res, "mkc_rt").maxAge).toBe(7 * 24 * 60 * 60 * 1000);
    const row = await RefreshTokenModel.findOne({});
    expect(row.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000);
    expect(row.expiresAt.getTime() - Date.now()).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
  });

  it("should fall back to the defaults for a bad lifetime", async () => {
    process.env.ACCESS_TOKEN_TTL_MINUTES = "abc";
    process.env.REFRESH_TOKEN_TTL_DAYS = "-3";
    const res = buildRes();

    await issueSession(res, user);

    expect(optionsFor(res, "mkc_at").maxAge).toBe(15 * 60 * 1000);
    expect(optionsFor(res, "mkc_rt").maxAge).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("should issue a different family for each sign-in", async () => {
    await issueSession(buildRes(), user);
    await issueSession(buildRes(), user);

    const families = (await RefreshTokenModel.find({})).map((row) => row.family);

    expect(new Set(families).size).toBe(2);
  });

  it("should clear both cookies with the paths they were set on", () => {
    const res = buildRes();

    clearSessionCookies(res);

    expect(res.clearCookie).toHaveBeenCalledWith("mkc_at", expect.objectContaining({ path: "/api" }));
    expect(res.clearCookie).toHaveBeenCalledWith(
      "mkc_rt",
      expect.objectContaining({ path: "/api/user/session" })
    );
  });
});
