import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";

import app from "../../index.js";
import RefreshTokenModel from "../../models/refresh-token.model.js";
import UserModel from "../../models/user.model.js";
import {
  authHeader,
  createOtp,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";
import { sha256 } from "../../utils/device.util.js";

const CSRF = { "X-Requested-With": "mkc" };

const setCookies = (response) => response.headers["set-cookie"] ?? [];

const setCookieLine = (response, name) =>
  setCookies(response).find((line) => line.startsWith(`${name}=`));

const cookieValue = (response, name) => setCookieLine(response, name)?.split(";")[0].split("=")[1];

const sessionHeaders = ({ at, rt }) => ({
  Cookie: [at && `mkc_at=${at}`, rt && `mkc_rt=${rt}`].filter(Boolean).join("; "),
  ...CSRF,
});

const loginAs = async (email, password) => {
  const response = await loginUser(email, password);
  return { response, at: cookieValue(response, "mkc_at"), rt: cookieValue(response, "mkc_rt") };
};

const refresh = (session) =>
  request(app).post("/api/user/session/refresh").set(sessionHeaders(session));

const legacyToken = (user, options = { expiresIn: "30 days" }) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, options);

describe("cookie session routes", () => {
  let users;

  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
    users = await seedAuthUsers();
  });

  afterAll(async () => {
    await teardownDb();
  });

  describe("login", () => {
    it("should set HttpOnly access and refresh cookies scoped to their paths", async () => {
      const { response } = await loginAs("member@mkc.com", "member123");

      const access = setCookieLine(response, "mkc_at");
      const refreshCookie = setCookieLine(response, "mkc_rt");

      expect(access).toMatch(/HttpOnly/i);
      expect(access).toMatch(/SameSite=Lax/i);
      expect(access).toMatch(/Path=\/api(;|$)/);
      expect(refreshCookie).toMatch(/HttpOnly/i);
      expect(refreshCookie).toMatch(/SameSite=Lax/i);
      expect(refreshCookie).toMatch(/Path=\/api\/user\/session(;|$)/);
    });

    it("should sign a 15 minute access token that names its session family", async () => {
      const { at, rt } = await loginAs("member@mkc.com", "member123");

      const payload = jwt.decode(at);
      const stored = await RefreshTokenModel.findOne({ tokenHash: sha256(rt) });

      expect(payload.id).toBe(String(users.memberUser._id));
      expect(payload.exp - payload.iat).toBe(15 * 60);
      expect(payload.sid).toBe(stored.family);
    });

    it("should store only the hash of the refresh token", async () => {
      const { rt } = await loginAs("member@mkc.com", "member123");

      const rows = await RefreshTokenModel.find({});

      expect(rows).toHaveLength(1);
      expect(rows[0].tokenHash).toBe(sha256(rt));
      expect(rows[0].tokenHash).not.toBe(rt);
    });

    it("should authenticate later requests from the access cookie", async () => {
      const { response } = await loginAs("member@mkc.com", "member123");

      const current = await request(app).get("/api/user/current-user").set(authHeader(response));

      expect(current.status).toBe(200);
      expect(current.body.user.email).toBe("member@mkc.com");
    });
  });

  describe("POST /api/user/session/refresh", () => {
    it("should rotate the refresh token and renew the access cookie", async () => {
      const session = await loginAs("member@mkc.com", "member123");

      const response = await refresh(session);

      const newRt = cookieValue(response, "mkc_rt");
      const oldRow = await RefreshTokenModel.findOne({ tokenHash: sha256(session.rt) });
      const newRow = await RefreshTokenModel.findOne({ tokenHash: sha256(newRt) });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(newRt).not.toBe(session.rt);
      expect(cookieValue(response, "mkc_at")).toBeTruthy();
      expect(oldRow.usedAt).toBeInstanceOf(Date);
      expect(newRow.usedAt).toBeNull();
      expect(newRow.family).toBe(oldRow.family);
    });

    it("should accept the new cookies after a rotation", async () => {
      const session = await loginAs("member@mkc.com", "member123");

      const response = await refresh(session);
      const current = await request(app)
        .get("/api/user/current-user")
        .set(authHeader(response));

      expect(current.status).toBe(200);
    });

    it("should serve a tab that replays the token within the grace window with a fresh pair", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      await refresh(session);

      const replay = await refresh(session);

      expect(replay.status).toBe(200);
      expect(cookieValue(replay, "mkc_at")).toBeTruthy();
      expect(cookieValue(replay, "mkc_rt")).toBeTruthy();
    });

    it("should serve a retry after a lost response while the new token was never used", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      await refresh(session);
      await RefreshTokenModel.updateOne(
        { tokenHash: sha256(session.rt) },
        { usedAt: new Date(Date.now() - 5 * 60 * 1000) }
      );

      const retry = await refresh(session);

      expect(retry.status).toBe(200);
      expect(cookieValue(retry, "mkc_rt")).toBeTruthy();
    });

    it("should drop the token a client never received when it retries", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      const lost = await refresh(session);
      await RefreshTokenModel.updateOne(
        { tokenHash: sha256(session.rt) },
        { usedAt: new Date(Date.now() - 5 * 60 * 1000) }
      );

      await refresh(session);
      const withLostToken = await refresh({ rt: cookieValue(lost, "mkc_rt") });

      expect(withLostToken.status).toBe(401);
    });

    it("should revoke the family when an old token is replayed after its successor was used", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      const first = await refresh(session);
      await refresh({ rt: cookieValue(first, "mkc_rt") });
      await RefreshTokenModel.updateOne(
        { tokenHash: sha256(session.rt) },
        { usedAt: new Date(Date.now() - 5 * 60 * 1000) }
      );

      const replay = await refresh(session);

      expect(replay.status).toBe(401);
      expect(await RefreshTokenModel.countDocuments({})).toBe(0);
    });

    it("should delete the whole family when a used token is replayed after the retry window", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      const rotated = await refresh(session);
      const newRt = cookieValue(rotated, "mkc_rt");
      await RefreshTokenModel.updateOne(
        { tokenHash: sha256(session.rt) },
        { usedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
      );

      const replay = await refresh(session);
      const afterwards = await refresh({ rt: newRt });

      expect(replay.status).toBe(401);
      expect(await RefreshTokenModel.countDocuments({})).toBe(0);
      expect(afterwards.status).toBe(401);
    });

    it("should clear both cookies when the refresh fails", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      await RefreshTokenModel.updateOne(
        { tokenHash: sha256(session.rt) },
        { expiresAt: new Date(Date.now() - 1000) }
      );

      const response = await refresh(session);

      expect(response.status).toBe(401);
      expect(setCookieLine(response, "mkc_at")).toMatch(/Expires=Thu, 01 Jan 1970/);
      expect(setCookieLine(response, "mkc_rt")).toMatch(/Expires=Thu, 01 Jan 1970/);
    });

    it("should reject an unknown refresh token", async () => {
      const response = await refresh({ rt: "A".repeat(43) });

      expect(response.status).toBe(401);
    });

    it("should reject a malformed refresh token", async () => {
      const response = await refresh({ rt: "not-a-token" });

      expect(response.status).toBe(401);
    });

    it("should reject a request with no refresh cookie", async () => {
      const response = await request(app).post("/api/user/session/refresh");

      expect(response.status).toBe(401);
    });

    it("should reject the refresh when the user no longer exists", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      await UserModel.deleteOne({ _id: users.memberUser._id });

      const response = await refresh(session);

      expect(response.status).toBe(401);
      expect(await RefreshTokenModel.countDocuments({})).toBe(0);
    });
  });

  describe("refresh token bookkeeping", () => {
    it("should delete used tokens older than the retry window on rotation", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      const first = await refresh(session);
      await RefreshTokenModel.updateOne(
        { tokenHash: sha256(session.rt) },
        { usedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
      );

      await refresh({ rt: cookieValue(first, "mkc_rt") });

      expect(await RefreshTokenModel.countDocuments({ tokenHash: sha256(session.rt) })).toBe(0);
      expect(await RefreshTokenModel.countDocuments({})).toBe(2);
    });

    it("should never extend a sign-in past the maximum session age", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      await RefreshTokenModel.updateOne(
        { tokenHash: sha256(session.rt) },
        { familyStartedAt: new Date(Date.now() - 89.5 * 24 * 60 * 60 * 1000) }
      );

      const response = await refresh(session);
      const next = await RefreshTokenModel.findOne({
        tokenHash: sha256(cookieValue(response, "mkc_rt")),
      });

      expect(next.expiresAt.getTime() - Date.now()).toBeLessThan(24 * 60 * 60 * 1000);
    });

    it("should not revive a session revoked while its refresh was in flight", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      const create = RefreshTokenModel.create.bind(RefreshTokenModel);
      const spy = jest.spyOn(RefreshTokenModel, "create").mockImplementationOnce(async (doc) => {
        await RefreshTokenModel.deleteMany({ family: doc.family });
        return create(doc);
      });

      const response = await refresh(session);
      spy.mockRestore();

      expect(response.status).toBe(401);
      expect(await RefreshTokenModel.countDocuments({})).toBe(0);
    });
  });

  describe("logout", () => {
    it("should delete the session family and clear the cookies", async () => {
      const session = await loginAs("member@mkc.com", "member123");

      const response = await request(app)
        .post("/api/user/session/logout")
        .set(sessionHeaders(session));
      const afterwards = await refresh(session);

      expect(response.status).toBe(200);
      expect(setCookieLine(response, "mkc_rt")).toMatch(/Expires=Thu, 01 Jan 1970/);
      expect(await RefreshTokenModel.countDocuments({})).toBe(0);
      expect(afterwards.status).toBe(401);
    });

    it("should leave other browsers signed in", async () => {
      const first = await loginAs("member@mkc.com", "member123");
      const second = await loginAs("member@mkc.com", "member123");

      await request(app).post("/api/user/session/logout").set(sessionHeaders(first));
      const other = await refresh(second);

      expect(other.status).toBe(200);
    });

    it("should succeed with no session", async () => {
      const response = await request(app).post("/api/user/session/logout");

      expect(response.status).toBe(200);
    });
  });

  describe("logout-all", () => {
    it("should delete every session of the user", async () => {
      const first = await loginAs("member@mkc.com", "member123");
      const second = await loginAs("member@mkc.com", "member123");
      const other = await loginAs("public@mkc.com", "public123");

      const response = await request(app)
        .post("/api/user/session/logout-all")
        .set(sessionHeaders(first));

      expect(response.status).toBe(200);
      expect((await refresh(first)).status).toBe(401);
      expect((await refresh(second)).status).toBe(401);
      expect((await refresh(other)).status).toBe(200);
    });

    it("should require authentication", async () => {
      const response = await request(app).post("/api/user/session/logout-all");

      expect(response.status).toBe(401);
    });
  });

  describe("password reset", () => {
    it("should end every session of the account", async () => {
      const session = await loginAs("member@mkc.com", "member123");
      await createOtp({ email: "member@mkc.com", otp: 123456 });

      const reset = await request(app)
        .put("/api/user/reset-password")
        .send({ email: "member@mkc.com", password: "new-password1", otp: 123456 });
      const response = await refresh(session);

      expect(reset.status).toBe(200);
      expect(response.status).toBe(401);
    });
  });

  describe("legacy tokens after a password reset", () => {
    it("should stop a token issued before the reset from authenticating or upgrading", async () => {
      const issuedAt = Math.floor(Date.now() / 1000) - 60;
      const legacy = jwt.sign({ id: users.memberUser._id, iat: issuedAt }, process.env.JWT_SECRET, {
        expiresIn: "30 days",
      });
      await createOtp({ email: "member@mkc.com", otp: 123456 });
      await request(app)
        .put("/api/user/reset-password")
        .send({ email: "member@mkc.com", password: "new-password1", otp: 123456 });

      const current = await request(app)
        .get("/api/user/current-user")
        .set("Authorization", `Bearer ${legacy}`);
      const upgrade = await request(app)
        .post("/api/user/session/upgrade")
        .set("Authorization", `Bearer ${legacy}`);

      expect(current.status).toBe(401);
      expect(upgrade.status).toBe(401);
      expect(await RefreshTokenModel.countDocuments({})).toBe(0);
    });

    it("should accept a session started after the reset", async () => {
      await createOtp({ email: "member@mkc.com", otp: 123456 });
      await request(app)
        .put("/api/user/reset-password")
        .send({ email: "member@mkc.com", password: "new-password1", otp: 123456 });

      const { response } = await loginAs("member@mkc.com", "new-password1");
      const current = await request(app).get("/api/user/current-user").set(authHeader(response));

      expect(current.status).toBe(200);
    });
  });

  describe("access token checks", () => {
    const currentUserWith = (at) =>
      request(app).get("/api/user/current-user").set("Cookie", `mkc_at=${at}`);

    it("should reject a tampered access cookie", async () => {
      const { at } = await loginAs("member@mkc.com", "member123");

      const response = await currentUserWith(`${at.slice(0, -2)}xx`);

      expect(response.status).toBe(401);
    });

    it("should reject an expired access cookie", async () => {
      const response = await currentUserWith(legacyToken(users.memberUser, { expiresIn: -10 }));

      expect(response.status).toBe(401);
    });

    it("should reject a token signed with another secret", async () => {
      const forged = jwt.sign({ id: users.memberUser._id }, "another-secret");

      const response = await currentUserWith(forged);

      expect(response.status).toBe(401);
    });

    it("should reject an unsigned token", async () => {
      const unsigned = jwt.sign({ id: users.memberUser._id }, "", { algorithm: "none" });

      const response = await currentUserWith(unsigned);

      expect(response.status).toBe(401);
    });

    it("should still accept a legacy Bearer token", async () => {
      const response = await request(app)
        .get("/api/user/current-user")
        .set("Authorization", `Bearer ${legacyToken(users.memberUser)}`);

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/user/session/upgrade", () => {
    it("should trade a legacy Bearer token for cookies", async () => {
      const response = await request(app)
        .post("/api/user/session/upgrade")
        .set("Authorization", `Bearer ${legacyToken(users.memberUser)}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe("member@mkc.com");
      expect(response.body).not.toHaveProperty("token");
      expect(cookieValue(response, "mkc_at")).toBeTruthy();
      expect(cookieValue(response, "mkc_rt")).toBeTruthy();
    });

    it("should not let a cookie session mint a second session", async () => {
      const { response } = await loginAs("member@mkc.com", "member123");

      const upgrade = await request(app)
        .post("/api/user/session/upgrade")
        .set(authHeader(response));

      expect(upgrade.status).toBe(401);
      expect(await RefreshTokenModel.countDocuments({})).toBe(1);
    });

    it("should reject a request with no credentials", async () => {
      const response = await request(app).post("/api/user/session/upgrade");

      expect(response.status).toBe(401);
    });
  });

  describe("CSRF protection", () => {
    it("should reject a state-changing request that has a session cookie but no header", async () => {
      const { response } = await loginAs("member@mkc.com", "member123");
      const { Cookie } = authHeader(response);

      const rejected = await request(app)
        .patch("/api/user/update-favorites")
        .set("Cookie", Cookie)
        .send({ favorites: [] });

      expect(rejected.status).toBe(403);
    });

    it("should accept the same request when it carries the header", async () => {
      const { response } = await loginAs("member@mkc.com", "member123");

      const accepted = await request(app)
        .patch("/api/user/update-favorites")
        .set(authHeader(response))
        .send({ favorites: [] });

      expect(accepted.status).toBe(200);
    });

    it("should not require the header on a read", async () => {
      const { response } = await loginAs("member@mkc.com", "member123");

      const current = await request(app)
        .get("/api/user/current-user")
        .set("Cookie", authHeader(response).Cookie);

      expect(current.status).toBe(200);
    });

    it("should reject a refresh that has the cookie but no header", async () => {
      const session = await loginAs("member@mkc.com", "member123");

      const response = await request(app)
        .post("/api/user/session/refresh")
        .set("Cookie", `mkc_rt=${session.rt}`);

      expect(response.status).toBe(403);
      expect(await RefreshTokenModel.countDocuments({ usedAt: { $ne: null } })).toBe(0);
    });
  });
});
