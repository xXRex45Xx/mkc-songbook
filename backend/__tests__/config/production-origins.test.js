import { afterEach, describe, expect, it, jest } from "@jest/globals";

describe("production boot", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it("should refuse to boot in production with no allowed origins", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.ALLOWED_ORIGINS;
    jest.resetModules();

    await expect(import("../../index.js")).rejects.toThrow("ALLOWED_ORIGINS must be set in production.");
  });
});
