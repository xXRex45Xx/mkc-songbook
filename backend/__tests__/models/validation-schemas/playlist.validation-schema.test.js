import { describe, expect, it } from "@jest/globals";

import {
  createPlaylistBodySchema,
  patchPlaylistBodySchema,
  updatePlaylistBodySchema,
} from "../../../models/validation-schemas/playlist.validation-schema.js";

describe("playlist validation schemas", () => {
  it("should require at least one patch field", () => {
    const { error } = patchPlaylistBodySchema.validate({});

    expect(error.message).toMatch(/must contain at least one of/);
  });

  it("should reject unsupported visibility values", () => {
    const { error } = createPlaylistBodySchema.validate({
      name: "Playlist",
      visibility: "team",
      songs: [],
    });

    expect(error).toBeTruthy();
  });

  it("should require at least one song on full playlist updates", () => {
    const { error } = updatePlaylistBodySchema.validate({
      name: "Playlist",
      visibility: "public",
      songs: [],
    });

    expect(error).toBeTruthy();
  });
});
