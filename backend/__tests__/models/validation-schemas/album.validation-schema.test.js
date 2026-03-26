import { describe, expect, it } from "@jest/globals";

import {
  createAlbumBodyValidationSchema,
  getAllAlbumsQuerySchema,
} from "../../../models/validation-schemas/album.validation-schema.js";

describe("album validation schemas", () => {
  it("should require at least one song when creating albums", () => {
    const { error } = createAlbumBodyValidationSchema.validate({ id: "album-001", title: "Album", songs: [] });

    expect(error).toBeTruthy();
  });

  it("should reject non-boolean names query values", () => {
    const { error } = getAllAlbumsQuerySchema.validate({ names: "invalid" });

    expect(error).toBeTruthy();
  });

  it("should allow valid album queries", () => {
    const { error } = getAllAlbumsQuerySchema.validate({ q: "Grace", names: true });

    expect(error).toBeUndefined();
  });
});
