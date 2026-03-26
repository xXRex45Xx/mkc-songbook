import { describe, expect, it } from "@jest/globals";

import {
  createLogBookBodySchema,
  getAllLogbookQuerySchema,
} from "../../../models/validation-schemas/service-logbook.validation-schema.js";

describe("service logbook validation schemas", () => {
  it("should require type when q is provided", () => {
    const { error } = getAllLogbookQuerySchema.validate({ q: "Mark" });

    expect(error.message).toMatch(/contains \[q\] without its required peers \[type\]/);
  });

  it("should reject timestamps in the past", () => {
    const { error } = createLogBookBodySchema.validate({
      location: "Saint Mark",
      timestamp: "2000-01-01T10:00:00.000Z",
      songs: ["song-001"],
    });

    expect(error).toBeTruthy();
  });

  it("should accept valid future logbook payloads", () => {
    const { error } = createLogBookBodySchema.validate({
      location: "Saint Mark",
      timestamp: "2099-01-01T10:00:00.000Z",
      songs: ["song-001"],
    });

    expect(error).toBeUndefined();
  });
});
