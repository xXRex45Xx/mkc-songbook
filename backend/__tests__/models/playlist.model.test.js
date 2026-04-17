import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import PlaylistModel from "../../models/playlist.model.js";
import {
  createUser,
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("playlist model", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("should default visibility to private", async () => {
    const user = await createUser();
    const playlist = await PlaylistModel.create({ name: "Playlist", creator: user._id, songs: [] });

    expect(playlist.visibility).toBe("private");
  });

  it("should require a creator", () => {
    const error = new PlaylistModel({ name: "Playlist", songs: [] }).validateSync();

    expect(error.errors.creator).toBeTruthy();
  });

  it("should reject unsupported visibility values", async () => {
    const user = await createUser();
    const error = new PlaylistModel({
      name: "Playlist",
      creator: user._id,
      visibility: "team",
      songs: [],
    }).validateSync();

    expect(error.errors.visibility).toBeTruthy();
  });
});
