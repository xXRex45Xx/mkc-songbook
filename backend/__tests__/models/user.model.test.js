import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import UserModel from "../../models/user.model.js";
import {
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("user model", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("should lowercase emails and default role to public", async () => {
    const user = await UserModel.create({
      email: "USER@EXAMPLE.COM",
      name: "Test User",
      password: "hashed:password123",
    });

    expect(user.email).toBe("user@example.com");
    expect(user.role).toBe("public");
  });

  it("should accept favorites and searchHistory references", async () => {
    const user = await UserModel.create({
      email: "user@example.com",
      name: "Test User",
      password: "hashed:password123",
      favorites: ["song-001"],
      searchHistory: ["507f1f77bcf86cd799439011"],
    });

    expect(user.favorites).toEqual(["song-001"]);
    expect(user.searchHistory).toHaveLength(1);
  });

  it("should reject invalid role values", () => {
    const error = new UserModel({
      email: "user@example.com",
      name: "Test User",
      password: "hashed:password123",
      role: "owner",
    }).validateSync();

    expect(error.errors.role).toBeTruthy();
  });
});
