import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import AlbumModel from "../../models/album.model.js";
import {
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("album model", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("should default createdAt to the current year", async () => {
    const album = await AlbumModel.create({ _id: "album-001", name: "Album" });

    expect(album.createdAt).toBe(new Date().getFullYear().toString());
  });

  it("should preserve photo fields and songs", async () => {
    const album = await AlbumModel.create({
      _id: "album-001",
      name: "Album",
      photoPath: "/tmp/album.jpg",
      photoLink: "/static/albums/images/album.jpg",
      songs: ["song-001"],
    });

    expect(album.photoPath).toBe("/tmp/album.jpg");
    expect(album.songs).toEqual(["song-001"]);
  });

  it("should require an album name", () => {
    const error = new AlbumModel({ _id: "album-001" }).validateSync();

    expect(error.errors.name).toBeTruthy();
  });
});
