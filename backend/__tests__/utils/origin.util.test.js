import { afterEach, describe, expect, it } from "@jest/globals";

import {
  MAX_ORIGIN_LENGTH,
  getAllowedOrigins,
  isAllowedOrigin,
  normalizeOrigin,
} from "../../utils/origin.util.js";

describe("allowed origins", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should normalize the list from ALLOWED_ORIGINS", () => {
    process.env.ALLOWED_ORIGINS = " https://app.example.org/ , http://localhost:5173 ,, ";

    expect(getAllowedOrigins()).toEqual(["https://app.example.org", "http://localhost:5173"]);
  });

  it("should be empty when ALLOWED_ORIGINS is unset", () => {
    delete process.env.ALLOWED_ORIGINS;

    expect(getAllowedOrigins()).toEqual([]);
  });
});

describe("normalizeOrigin", () => {
  it("should strip any run of trailing slashes", () => {
    expect(normalizeOrigin("http://localhost:3000")).toBe("http://localhost:3000");
    expect(normalizeOrigin("http://localhost:3000/")).toBe("http://localhost:3000");
    expect(normalizeOrigin("http://localhost:3000///")).toBe("http://localhost:3000");
  });

  it("should keep slashes that are not trailing", () => {
    expect(normalizeOrigin("http://a/b/")).toBe("http://a/b");
  });

  it("should reduce an all-slash value to an empty string", () => {
    expect(normalizeOrigin("///")).toBe("");
    expect(normalizeOrigin("")).toBe("");
  });

  it("should return null for a value that is not a string", () => {
    expect(normalizeOrigin(undefined)).toBeNull();
    expect(normalizeOrigin(["http://localhost:3000"])).toBeNull();
  });

  it("should accept a value of exactly the maximum length and reject one char more", () => {
    const atLimit = `http://${"a".repeat(MAX_ORIGIN_LENGTH - 7)}`;

    expect(normalizeOrigin(atLimit)).toBe(atLimit);
    expect(normalizeOrigin(`${atLimit}a`)).toBeNull();
  });

  it("should return fast on a long slash run followed by another character", () => {
    const hostile = `${"/".repeat(15000)}x`;
    const start = process.hrtime.bigint();

    expect(normalizeOrigin(hostile)).toBeNull();

    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    expect(elapsedMs).toBeLessThan(100);
  });
});

describe("isAllowedOrigin", () => {
  const allowed = ["http://localhost:3000", "https://app.example.org"];

  it("should accept a listed origin with or without trailing slashes", () => {
    expect(isAllowedOrigin("http://localhost:3000", allowed)).toBe(true);
    expect(isAllowedOrigin("https://app.example.org/", allowed)).toBe(true);
    expect(isAllowedOrigin("https://app.example.org//", allowed)).toBe(true);
  });

  it("should reject an unlisted origin", () => {
    expect(isAllowedOrigin("https://evil.example", allowed)).toBe(false);
  });

  it("should reject an over-long origin, even one that starts with a listed origin", () => {
    expect(isAllowedOrigin(`http://localhost:3000${"/".repeat(MAX_ORIGIN_LENGTH)}`, allowed)).toBe(
      false
    );
    expect(isAllowedOrigin(`${"/".repeat(15000)}x`, allowed)).toBe(false);
  });
});
