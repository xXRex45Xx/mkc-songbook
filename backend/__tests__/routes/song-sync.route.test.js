import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";

import app from "../../index.js";
import SongModel from "../../models/song.model.js";
import {
  authHeader,
  createSong,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("song edits reach delta sync", () => {
  let token;
  let before;

  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
    await seedAuthUsers();
    await createSong({ _id: "song-001", updatedAt: new Date("2020-01-01") });
    token = (await loginUser("admin-route@mkc.com", "admin123")).body.token;
    before = new Date();
  });

  afterAll(async () => {
    await teardownDb();
  });

  const syncedIds = async () => {
    const response = await request(app)
      .get("/api/song")
      .query({ all: true, syncSince: before.toISOString() })
      .set(authHeader(token));
    return response.body.songs.map((song) => song._id);
  };

  it("returns a PUT-edited song from ?syncSince", async () => {
    await request(app)
      .put("/api/song/song-001")
      .set(authHeader(token))
      .send({
        id: "song-001",
        title: "New",
        lyrics: "New lyrics",
        chord: "G",
        tempo: 95,
        rythm: "3/4",
      })
      .expect(200);

    expect((await SongModel.findById("song-001")).updatedAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(await syncedIds()).toContain("song-001");
  });

  it("returns a PATCH-edited song from ?syncSince", async () => {
    await request(app)
      .patch("/api/song/song-001")
      .set(authHeader(token))
      .send({ "video-link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
      .expect(200);

    expect((await SongModel.findById("song-001")).updatedAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(await syncedIds()).toContain("song-001");
  });
});
