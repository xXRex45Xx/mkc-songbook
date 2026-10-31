import { afterEach, describe, expect, it } from "@jest/globals";

import { getAllowedOrigins } from "../../utils/origin.util.js";

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
