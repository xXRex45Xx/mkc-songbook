import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";

import {
  getAllOrSearchUsers,
  googleOAuthLogin,
  updateFavorites,
  verifyOTP,
} from "../../controllers/user.controller.js";
import OTPModel from "../../models/otp.model.js";
import UserModel from "../../models/user.model.js";
import { ClientFaultError, UnauthorizedError } from "../../utils/error.util.js";

const mockGoogle = ({ aud = process.env.GOOGLE_CLIENT_ID, profile = {} } = {}) => {
  global.fetch.mockImplementation(async (url) => ({
    ok: true,
    json: async () =>
      String(url).includes("tokeninfo")
        ? { aud }
        : {
            email: "google@example.com",
            email_verified: true,
            name: "Google User",
            picture: "https://example.com/google.jpg",
            ...profile,
          },
  }));
};

describe("user controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("should pass the submitted code to OTP verification", async () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    OTPModel.verifyCode = jest.fn().mockResolvedValue(true);

    await verifyOTP({ body: { email: "verify@example.com", otp: "123456" } }, res);

    expect(OTPModel.verifyCode).toHaveBeenCalledWith("verify@example.com", "123456");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should throw for invalid OTP pairs", async () => {
    OTPModel.verifyCode = jest.fn().mockResolvedValue(false);

    await expect(
      verifyOTP({ body: { email: "verify@example.com", otp: 123456 } }, {}),
    ).rejects.toThrow(ClientFaultError);
  });

  it("should search users by email", async () => {
    const users = [{ _id: "user-001", email: "member@mkc.com", name: "Member" }];
    const findResult = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(users),
    };
    const countResult = { countDocuments: jest.fn().mockResolvedValue(1) };
    UserModel.find = jest.fn((query, projection) => {
      if (projection) {
        return findResult;
      }

      return countResult;
    });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllOrSearchUsers(
      { query: { q: "member@mkc.com", type: "email", page: 1 } },
      res,
    );

    expect(UserModel.find).toHaveBeenNthCalledWith(
      1,
      { email: { $regex: "member@mkc.com", $options: "i" } },
      { name: true, email: true, role: true },
    );
    expect(UserModel.find).toHaveBeenNthCalledWith(2, {
      email: { $regex: "member@mkc.com", $options: "i" },
    });
    expect(res.json).toHaveBeenCalledWith({ users, totalPages: 1 });
  });

  it("should search users across name and email when type is all", async () => {
    const users = [{ _id: "user-001", email: "member@mkc.com", name: "Member User" }];
    const findResult = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(users),
    };
    const countResult = { countDocuments: jest.fn().mockResolvedValue(1) };
    UserModel.find = jest.fn((query, projection) => {
      if (projection) {
        return findResult;
      }

      return countResult;
    });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllOrSearchUsers({ query: { q: "member", type: "all" } }, res);

    expect(UserModel.find).toHaveBeenNthCalledWith(
      1,
      {
        $or: [
          { name: { $regex: "member", $options: "i" } },
          { email: { $regex: "member", $options: "i" } },
        ],
      },
      { name: true, email: true, role: true },
    );
    expect(res.json).toHaveBeenCalledWith({ users, totalPages: 1 });
  });

  it("should create a new Google user when one does not exist", async () => {
    const res = { json: jest.fn() };
    const createdUser = {
      _id: "user-001",
      email: "google@example.com",
      name: "Google User",
      role: "public",
      favorites: [],
    };
    mockGoogle();
    UserModel.findOne = jest.fn().mockResolvedValue(null);
    UserModel.create = jest.fn().mockResolvedValue(createdUser);
    jest.spyOn(jwt, "sign").mockReturnValue("jwt-token");

    await googleOAuthLogin({ body: { accessToken: "token-123" } }, res);

    expect(UserModel.create).toHaveBeenCalledWith({
      email: "google@example.com",
      name: "Google User",
      photo: "https://example.com/google.jpg",
    });
    expect(res.json).toHaveBeenCalledWith({
      token: "jwt-token",
      user: {
        id: "user-001",
        name: "Google User",
        email: "google@example.com",
        role: "public",
        favorites: [],
      },
    });
  });

  it("should reject a Google token issued to another app", async () => {
    mockGoogle({ aud: "some-other-app" });
    UserModel.create = jest.fn();

    await expect(
      googleOAuthLogin({ body: { accessToken: "token-123" } }, { json: jest.fn() }),
    ).rejects.toThrow(UnauthorizedError);
    expect(UserModel.create).not.toHaveBeenCalled();
  });

  it("should reject a Google account with an unverified email", async () => {
    mockGoogle({ profile: { email_verified: false } });
    UserModel.create = jest.fn();

    await expect(
      googleOAuthLogin({ body: { accessToken: "token-123" } }, { json: jest.fn() }),
    ).rejects.toThrow(UnauthorizedError);
    expect(UserModel.create).not.toHaveBeenCalled();
  });

  it("should reuse an existing Google user without creating a duplicate", async () => {
    const res = { json: jest.fn() };
    const existingUser = {
      _id: "user-001",
      email: "google@example.com",
      name: "Existing User",
      role: "member",
      favorites: ["song-001"],
    };
    mockGoogle();
    UserModel.findOne = jest.fn().mockResolvedValue(existingUser);
    UserModel.create = jest.fn();
    jest.spyOn(jwt, "sign").mockReturnValue("jwt-token");

    await googleOAuthLogin({ body: { accessToken: "token-123" } }, res);

    expect(UserModel.create).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      token: "jwt-token",
      user: {
        id: "user-001",
        name: "Existing User",
        email: "google@example.com",
        role: "member",
        favorites: ["song-001"],
      },
    });
  });

  it("should replace favorites when a full list is provided", async () => {
    const save = jest.fn();
    const req = {
      body: { favorites: ["song-002"] },
      user: { favorites: ["song-001"], save },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateFavorites(req, res);

    expect(req.user.favorites).toEqual(["song-002"]);
    expect(save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ updated: true });
  });

  it("should add songs when addSongs is provided", async () => {
    const save = jest.fn();
    const req = {
      body: { addSongs: ["song-002"] },
      user: { favorites: ["song-001"], save },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateFavorites(req, res);

    expect(req.user.favorites).toEqual(["song-001", "song-002"]);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("should remove songs and initialize favorites when needed", async () => {
    const save = jest.fn();
    const req = {
      body: { removeSongs: ["song-001"] },
      user: { favorites: undefined, save },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateFavorites(req, res);

    expect(req.user.favorites).toEqual([]);
    expect(save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ updated: true });
  });
});
