import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from "bcrypt";
import request from "supertest";

import app from "../../index.js";
import OTPModel from "../../models/otp.model.js";
import UserModel from "../../models/user.model.js";
import {
  authHeader,
  createOtp,
  createSong,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("user routes", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await resetDatabase();
    global.fetch = jest.fn();
  });

  afterAll(async () => {
    await teardownDb();
  });

  describe("POST /api/user/otp", () => {
    it("should create an OTP for a new registration request", async () => {
      const response = await request(app)
        .post("/api/user/otp")
        .send({ email: "new-user@example.com" });

      const otp = await OTPModel.findOne({ email: "new-user@example.com" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(otp).toBeTruthy();
    });

    it("should create an OTP for forgot password when the user exists", async () => {
      await seedAuthUsers();

      const response = await request(app)
        .post("/api/user/otp?forgotPassword=true")
        .send({ email: "member@mkc.com" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(await OTPModel.findOne({ email: "member@mkc.com" })).toBeTruthy();
    });

    it("should reject forgot password when the user does not exist", async () => {
      const response = await request(app)
        .post("/api/user/otp?forgotPassword=true")
        .send({ email: "missing-user@example.com" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User doesn't exist");
    });

    it("should reject OTP registration requests for an existing user", async () => {
      await seedAuthUsers();

      const response = await request(app).post("/api/user/otp").send({ email: "member@mkc.com" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });

    it("should overwrite an existing OTP for the same email", async () => {
      const existingOtp = await createOtp({ email: "replace@example.com", otp: 111111 });

      const response = await request(app).post("/api/user/otp").send({ email: "replace@example.com" });
      const otps = await OTPModel.find({ email: "replace@example.com" });

      expect(response.status).toBe(200);
      expect(otps).toHaveLength(1);
      expect(otps[0]._id.toString()).toBe(existingOtp._id.toString());
      expect(new Date(otps[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(existingOtp.createdAt).getTime(),
      );
    });
  });

  describe("POST /api/user/verify-otp", () => {
    it("should verify a valid OTP", async () => {
      await createOtp({ email: "verify@example.com", otp: 123456 });

      const response = await request(app)
        .post("/api/user/verify-otp")
        .send({ email: "verify@example.com", otp: 123456 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it("should reject an invalid OTP", async () => {
      await createOtp({ email: "verify@example.com", otp: 123456 });

      const response = await request(app)
        .post("/api/user/verify-otp")
        .send({ email: "verify@example.com", otp: 654321 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("The verification code is invalid");
    });

    it("should verify a string OTP payload", async () => {
      await createOtp({ email: "verify@example.com", otp: 123456 });

      const response = await request(app)
        .post("/api/user/verify-otp")
        .send({ email: "verify@example.com", otp: "123456" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe("POST /api/user", () => {
    it("should register a new user with a valid OTP", async () => {
      await createOtp({ email: "register@example.com", otp: 123456 });

      const response = await request(app)
        .post("/api/user")
        .send({
          email: "register@example.com",
          name: "Registered User",
          password: "password123",
          otp: 123456,
        });

      const user = await UserModel.findOne({ email: "register@example.com" });
      const otp = await OTPModel.findOne({ email: "register@example.com" });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe("register@example.com");
      expect(response.body).toHaveProperty("token");
      expect(user).toBeTruthy();
      expect(await bcrypt.compare("password123", user.password)).toBe(true);
      expect(otp).toBeNull();
    });

    it("should reject registration when the user already exists", async () => {
      await seedAuthUsers();
      await createOtp({ email: "public@mkc.com", otp: 123456 });

      const response = await request(app)
        .post("/api/user")
        .send({
          email: "public@mkc.com",
          name: "Public User",
          password: "public123",
          otp: 123456,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });

    it("should reject registration when the OTP is invalid", async () => {
      await createOtp({ email: "register@example.com", otp: 123456 });

      const response = await request(app)
        .post("/api/user")
        .send({
          email: "register@example.com",
          name: "Registered User",
          password: "password123",
          otp: 654321,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Verification code is invalid.");
    });
  });

  describe("POST /api/user/login", () => {
    it("should log in an existing user", async () => {
      await seedAuthUsers();

      const response = await loginUser("member@mkc.com", "member123");

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe("member@mkc.com");
      expect(response.body).toHaveProperty("token");
    });

    it("should reject invalid credentials", async () => {
      await seedAuthUsers();

      const response = await loginUser("member@mkc.com", "wrong-password");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid username or password.");
    });
  });

  describe("GET /api/user/current-user", () => {
    it("should return the current user when authenticated", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get("/api/user/current-user")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe("member@mkc.com");
    });

    it("should return 401 when unauthenticated", async () => {
      const response = await request(app).get("/api/user/current-user");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/user/google/callback", () => {
    it("should create a new user from Google OAuth", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          email: "google@example.com",
          name: "Google User",
          picture: "https://example.com/google.jpg",
        }),
      });

      const response = await request(app)
        .post("/api/user/google/callback")
        .send({ accessToken: "valid-token" });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe("google@example.com");
      expect(await UserModel.findOne({ email: "google@example.com" })).toBeTruthy();
    });

    it("should reject an invalid Google token", async () => {
      global.fetch.mockResolvedValue({ ok: false });

      const response = await request(app)
        .post("/api/user/google/callback")
        .send({ accessToken: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        "Failed to sign up or login with google. Please, try again.",
      );
    });

    it("should log in an existing Google user without creating a duplicate", async () => {
      await UserModel.create({
        email: "google@example.com",
        name: "Existing Google User",
        password: "hashed:password123",
        role: "public",
      });
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          email: "google@example.com",
          name: "Google User",
          picture: "https://example.com/google.jpg",
        }),
      });

      const response = await request(app)
        .post("/api/user/google/callback")
        .send({ accessToken: "valid-token" });

      expect(response.status).toBe(200);
      expect(await UserModel.countDocuments({ email: "google@example.com" })).toBe(1);
    });

    it("should return a generic server error when Google userinfo fetch fails", async () => {
      global.fetch.mockRejectedValue(new Error("network failure"));

      const response = await request(app)
        .post("/api/user/google/callback")
        .send({ accessToken: "valid-token" });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("An unexpected error occurred.");
    });
  });

  describe("PUT /api/user/reset-password", () => {
    it("should reset the password with a valid OTP", async () => {
      await seedAuthUsers();
      await createOtp({ email: "member@mkc.com", otp: 555555 });

      const response = await request(app)
        .put("/api/user/reset-password")
        .send({ email: "member@mkc.com", password: "newpassword123", otp: 555555 });

      const user = await UserModel.findOne({ email: "member@mkc.com" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(await bcrypt.compare("newpassword123", user.password)).toBe(true);
      expect(await OTPModel.findOne({ email: "member@mkc.com" })).toBeNull();
    });

    it("should reject password reset with an invalid OTP", async () => {
      await seedAuthUsers();
      await createOtp({ email: "member@mkc.com", otp: 555555 });

      const response = await request(app)
        .put("/api/user/reset-password")
        .send({ email: "member@mkc.com", password: "newpassword123", otp: 123456 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Verification code is invalid.");
    });

    it("should keep succeeding even when the user does not exist", async () => {
      await createOtp({ email: "missing@mkc.com", otp: 555555 });

      const response = await request(app)
        .put("/api/user/reset-password")
        .send({ email: "missing@mkc.com", password: "newpassword123", otp: 555555 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(await UserModel.findOne({ email: "missing@mkc.com" })).toBeNull();
    });
  });

  describe("GET /api/user", () => {
    it("should return users to an admin", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .get("/api/user")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(4);
      expect(response.body.totalPages).toBe(1);
    });

    it("should reject a public user", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("public@mkc.com", "public123");

      const response = await request(app)
        .get("/api/user")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You are not authorized to access this resource.");
    });

    it("should search users by name for an admin", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .get("/api/user?q=Member&type=name")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].email).toBe("member@mkc.com");
    });

    it("should search users by email for an admin", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .get("/api/user?q=member@mkc.com&type=email")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].email).toBe("member@mkc.com");
    });

    it("should search users across name and email when type is all", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .get("/api/user?q=member&type=all")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.users.some((user) => user.email === "member@mkc.com")).toBe(true);
    });
  });

  describe("PATCH /api/user/:id", () => {
    it("should allow a super-admin to update a user role", async () => {
      const { memberUser } = await seedAuthUsers();
      const loginResponse = await loginUser("admin@mkc.com", "admin123");

      const response = await request(app)
        .patch(`/api/user/${memberUser._id}`)
        .set(authHeader(loginResponse.body.token))
        .send({ role: "admin" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ updated: true });
      expect((await UserModel.findById(memberUser._id)).role).toBe("admin");
    });

    it("should reject an admin changing another admin role", async () => {
      const { adminUser } = await seedAuthUsers();
      const otherAdmin = await UserModel.create({
        email: "other-admin@example.com",
        name: "Other Admin",
        password: await bcrypt.hash("otheradmin123", 10),
        role: "admin",
      });
      const loginResponse = await loginUser("admin-route@mkc.com", "admin123");

      const response = await request(app)
        .patch(`/api/user/${otherAdmin._id}`)
        .set(authHeader(loginResponse.body.token))
        .send({ role: "member" });

      expect(adminUser.role).toBe("admin");
      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You are not authorized to change this role");
    });

    it("should reject changing a super-admin role", async () => {
      const { superAdminUser } = await seedAuthUsers();
      const loginResponse = await loginUser("admin@mkc.com", "admin123");

      const response = await request(app)
        .patch(`/api/user/${superAdminUser._id}`)
        .set(authHeader(loginResponse.body.token))
        .send({ role: "member" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Super admin role cannot be changed");
    });

    it("should return 404 when the target user does not exist", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("admin@mkc.com", "admin123");

      const response = await request(app)
        .patch("/api/user/507f1f77bcf86cd799439011")
        .set(authHeader(loginResponse.body.token))
        .send({ role: "member" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("/api/user/favorites", () => {
    it("should return the current user's favorites", async () => {
      const { memberUser } = await seedAuthUsers();
      memberUser.favorites = [];
      await memberUser.save();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get("/api/user/favorites")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Favorites");
      expect(response.body.visibility).toBe("private");
    });

    it("should update favorites for the current user", async () => {
      const { memberUser } = await seedAuthUsers();
      await createSong({ _id: "song-001" });
      await createSong({ _id: "song-002" });
      memberUser.favorites = ["song-001"];
      await memberUser.save();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .patch("/api/user/update-favorites")
        .set(authHeader(loginResponse.body.token))
        .send({ addSongs: ["song-002"], removeSongs: ["song-001"] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ updated: true });
      expect((await UserModel.findById(memberUser._id)).favorites).toEqual(["song-002"]);
    });

    it("should reject unauthenticated favorites reads", async () => {
      const response = await request(app).get("/api/user/favorites");

      expect(response.status).toBe(401);
    });

    it("should reject unauthenticated favorites updates", async () => {
      const response = await request(app)
        .patch("/api/user/update-favorites")
        .send({ addSongs: ["song-001"] });

      expect(response.status).toBe(401);
    });

    it("should reject favorites replacement when a song does not exist", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .patch("/api/user/update-favorites")
        .set(authHeader(loginResponse.body.token))
        .send({ favorites: ["song-404"] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("One or more songs don't exist.");
    });

    it("should replace favorites when favorites is provided", async () => {
      const { memberUser } = await seedAuthUsers();
      await createSong({ _id: "song-001" });
      await createSong({ _id: "song-002" });
      memberUser.favorites = ["song-001"];
      await memberUser.save();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .patch("/api/user/update-favorites")
        .set(authHeader(loginResponse.body.token))
        .send({ favorites: ["song-002"] });

      expect(response.status).toBe(200);
      expect((await UserModel.findById(memberUser._id)).favorites).toEqual(["song-002"]);
    });

    it("should add songs to favorites without replacing existing entries", async () => {
      const { memberUser } = await seedAuthUsers();
      await createSong({ _id: "song-001" });
      await createSong({ _id: "song-002" });
      memberUser.favorites = ["song-001"];
      await memberUser.save();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .patch("/api/user/update-favorites")
        .set(authHeader(loginResponse.body.token))
        .send({ addSongs: ["song-002"] });

      expect(response.status).toBe(200);
      expect((await UserModel.findById(memberUser._id)).favorites).toEqual(["song-001", "song-002"]);
    });

    it("should remove songs from favorites without replacing the remaining entries", async () => {
      const { memberUser } = await seedAuthUsers();
      await createSong({ _id: "song-001" });
      await createSong({ _id: "song-002" });
      memberUser.favorites = ["song-001", "song-002"];
      await memberUser.save();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .patch("/api/user/update-favorites")
        .set(authHeader(loginResponse.body.token))
        .send({ removeSongs: ["song-001"] });

      expect(response.status).toBe(200);
      expect((await UserModel.findById(memberUser._id)).favorites).toEqual(["song-002"]);
    });
  });
});
