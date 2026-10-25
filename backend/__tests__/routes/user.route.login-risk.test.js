import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

import app from "../../index.js";
import DeviceModel from "../../models/device.model.js";
import LoginAttemptModel from "../../models/login-attempt.model.js";
import { testUsers } from "../../jest/fixtures/users.js";
import {
  ensureDbConnection,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

const BROWSER = {
  "User-Agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/126.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

const login = (body, headers = BROWSER) =>
  request(app).post("/api/user/login").set(headers).send(body);

const member = { email: testUsers.member.email, password: testUsers.member.password };
const wrong = { email: member.email, password: `${member.password}-wrong` };

const deviceCookieOf = (response) =>
  (response.headers["set-cookie"] ?? [])
    .find((cookie) => cookie.startsWith("mkc_did="))
    ?.split(";")[0];

describe("login risk", () => {
  const realFetch = global.fetch;

  beforeAll(async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret";
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
    await seedAuthUsers();
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ success: true }) });
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  afterAll(async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    await teardownDb();
  });

  it("should let a browser from an unknown device sign in without a captcha", async () => {
    const response = await login(member);

    expect(response.status).toBe(200);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should remember the device with an HttpOnly cookie and store only its hash", async () => {
    const response = await login(member);

    const cookie = response.headers["set-cookie"].find((c) => c.startsWith("mkc_did="));
    expect(cookie).toContain("HttpOnly");
    const token = cookie.split(";")[0].split("=")[1];
    const devices = await DeviceModel.find({});
    expect(devices).toHaveLength(1);
    expect(devices[0].tokenHash).not.toBe(token);
  });

  it("should not issue a second device for a browser that is already known", async () => {
    const first = await login(member);
    const second = await login(member, { ...BROWSER, Cookie: deviceCookieOf(first) });

    expect(second.status).toBe(200);
    expect(deviceCookieOf(second)).toBeUndefined();
    expect(await DeviceModel.countDocuments({})).toBe(1);
  });

  it("should require a captcha from a script-like client", async () => {
    const response = await login(member, { "User-Agent": "curl/8.4.0" });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("CAPTCHA_REQUIRED");
  });

  it("should accept a script-like client that solves the captcha", async () => {
    const response = await login(
      { ...member, captchaToken: "solved" },
      { "User-Agent": "curl/8.4.0" }
    );

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should reject a captcha that Cloudflare refuses", async () => {
    global.fetch.mockResolvedValue({ json: async () => ({ success: false }) });

    const response = await login(
      { ...member, captchaToken: "bad" },
      { "User-Agent": "curl/8.4.0" }
    );

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("CAPTCHA_REQUIRED");
  });

  it("should require a captcha after the fifth failed attempt from the same client", async () => {
    for (let i = 0; i < 5; i++) expect((await login(wrong)).status).toBe(400);

    const response = await login(member);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("CAPTCHA_REQUIRED");
  });

  it("should keep counting when the client discards its device cookie", async () => {
    for (let i = 0; i < 3; i++) {
      await login(wrong, { ...BROWSER, Cookie: `mkc_did=${"a".repeat(43)}` });
    }
    for (let i = 0; i < 2; i++) await login(wrong);

    expect((await login(member)).status).toBe(403);
  });

  it("should accept the right password with a solved captcha and clear the count", async () => {
    for (let i = 0; i < 5; i++) await login(wrong);

    const solved = await login({ ...member, captchaToken: "solved" });
    const after = await login(member);

    expect(solved.status).toBe(200);
    expect(after.status).toBe(200);
    expect(await LoginAttemptModel.countDocuments({})).toBe(0);
  });

  it("should skip the checks for a known device even after failures elsewhere", async () => {
    const first = await login(member);
    for (let i = 0; i < 6; i++) await login(wrong);

    const response = await login(member, {
      "User-Agent": "curl/8.4.0",
      Cookie: deviceCookieOf(first),
    });

    expect(response.status).toBe(200);
  });

  it("should not treat a device known to one account as known for another", async () => {
    const first = await login(member);

    const response = await login(
      { email: testUsers.admin.email, password: testUsers.admin.password },
      { "User-Agent": "curl/8.4.0", Cookie: deviceCookieOf(first) }
    );

    expect(response.status).toBe(403);
  });
});
