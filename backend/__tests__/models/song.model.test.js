import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import SongModel from "../../models/song.model.js";
import {
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("song model", () => {
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
    const song = await SongModel.create({ _id: "song-001", title: "Song", lyrics: "Lyrics" });

    expect(song.createdAt).toBe(new Date().getFullYear().toString());
  });

  it("should preserve musicElements and album references", async () => {
    const song = await SongModel.create({
      _id: "song-001",
      title: "Song",
      lyrics: "Lyrics",
      musicElements: { chord: "C", tempo: 120, rythm: "4/4" },
      albums: ["album-001"],
    });

    expect(song.musicElements.tempo).toBe(120);
    expect(song.albums).toEqual(["album-001"]);
  });

  it("should require title and lyrics", () => {
    const error = new SongModel({ _id: "song-001" }).validateSync();

    expect(error.errors.title).toBeTruthy();
    expect(error.errors.lyrics).toBeTruthy();
  });
});
