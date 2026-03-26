import { describe, expect, it } from "@jest/globals";

import {
  createSongBodyValidationSchema,
  getAllSongsQuerySchema,
  patchSongBodyValidationSchema,
} from "../../../models/validation-schemas/song.validation-shcema.js";

describe("song validation schemas", () => {
  it("should reject q and all being used together", () => {
    const { error } = getAllSongsQuerySchema.validate({ q: "grace", type: "title", all: true });

    expect(error.message).toMatch(/contains a conflict between optional exclusive peers/);
  });

  it("should require type when q is provided", () => {
    const { error } = getAllSongsQuerySchema.validate({ q: "grace" });

    expect(error.message).toMatch(/contains \[q\] without its required peers \[type\]/);
  });

  it("should allow supported sort values", () => {
    const { error } = getAllSongsQuerySchema.validate({ sortBy: "A-Z" });

    expect(error).toBeUndefined();
  });

  it("should reject invalid YouTube links in create schema", () => {
    const { error } = createSongBodyValidationSchema.validate({
      id: "song-001",
      title: "Song",
      lyrics: "Lyrics",
      "video-link": "https://example.com/video",
    });

    expect(error).toBeTruthy();
  });

  it("should allow valid YouTube links in patch schema", () => {
    const { error } = patchSongBodyValidationSchema.validate({
      "video-link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    expect(error).toBeUndefined();
  });
});
