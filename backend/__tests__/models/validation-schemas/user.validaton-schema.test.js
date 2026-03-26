import { describe, expect, it } from "@jest/globals";

import {
  getAllUsersQuerySchema,
  registerUserBodySchema,
  updateFavoritesBodySchema,
} from "../../../models/validation-schemas/user.validaton-schema.js";

describe("user validation schemas", () => {
  it("should reject registration OTP values outside the 6 digit range", () => {
    const { error } = registerUserBodySchema.validate({
      email: "user@example.com",
      name: "Test User",
      password: "password123",
      otp: 99999,
    });

    expect(error.message).toContain("The validation code must be a 6 digit number.");
  });

  it("should require type when q is provided for user search", () => {
    const { error } = getAllUsersQuerySchema.validate({ q: "member" });

    expect(error.message).toMatch(/contains \[q\] without its required peers \[type\]/);
  });

  it("should require one of favorites, addSongs, or removeSongs", () => {
    const { error } = updateFavoritesBodySchema.validate({});

    expect(error.message).toMatch(/must contain at least one of/);
  });
});
