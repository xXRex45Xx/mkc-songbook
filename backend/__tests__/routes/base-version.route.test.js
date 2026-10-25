import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";

import app from "../../index.js";
import AlbumModel from "../../models/album.model.js";
import PlaylistModel from "../../models/playlist.model.js";
import SongModel from "../../models/song.model.js";
import {
  authHeader,
  createAlbum,
  createPlaylist,
  createSong,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

const STALE = "2020-01-01T00:00:00.000Z";
const FRESH = new Date(Date.now() + 60_000).toISOString();

describe("base-version check on replayed writes", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  const admin = async () => {
    const users = await seedAuthUsers();
    const login = await loginUser("admin-route@mkc.com", "admin123");
    return { token: login.body.token, users };
  };

  it("should answer 409 and keep the song when the base version is older than the stored one", async () => {
    const { token } = await admin();
    await createSong({ _id: "song-001", title: "Server Title", updatedAt: new Date() });

    const response = await request(app)
      .delete("/api/song/song-001")
      .set(authHeader(token))
      .set("X-Base-Updated-At", STALE);

    expect(response.status).toBe(409);
    expect(await SongModel.findById("song-001")).toBeTruthy();
  });

  it("should apply the song edit when the base version matches", async () => {
    const { token } = await admin();
    const song = await createSong({ _id: "song-001", title: "Old" });

    const response = await request(app)
      .put("/api/song/song-001")
      .set(authHeader(token))
      .set("X-Base-Updated-At", song.updatedAt.toISOString())
      .send({ id: "song-001", title: "Edited", lyrics: "Lyrics", chord: "G", tempo: 95, rythm: "3/4" });

    expect(response.body).toEqual({ updated: true });
    expect((await SongModel.findById("song-001")).title).toBe("Edited");
  });

  it("should answer 409 for a stale album update and keep the album", async () => {
    const { token } = await admin();
    await createSong({ _id: "song-001" });
    await createAlbum({ _id: "album-001", name: "Server Name", songs: ["song-001"] });

    const response = await request(app)
      .delete("/api/album/album-001")
      .set(authHeader(token))
      .set("X-Base-Updated-At", STALE);

    expect(response.status).toBe(409);
    expect((await AlbumModel.findById("album-001")).name).toBe("Server Name");
  });

  it("should answer 409 for a stale playlist patch and keep the playlist unchanged", async () => {
    const { token, users } = await admin();
    const playlist = await createPlaylist({
      creator: users.superAdminUser._id,
      songs: ["song-001"],
    });

    const response = await request(app)
      .patch(`/api/playlist/${playlist._id}`)
      .set(authHeader(token))
      .set("X-Base-Updated-At", STALE)
      .send({ removeSongs: ["song-001"] });

    expect(response.status).toBe(409);
    expect((await PlaylistModel.findById(playlist._id)).songs).toEqual(["song-001"]);
  });

  it("should not check a request that carries no base version or an unparsable one", async () => {
    const { token } = await admin();
    await createSong({ _id: "song-001" });
    await createSong({ _id: "song-002" });

    const plain = await request(app).delete("/api/song/song-001").set(authHeader(token));
    const garbled = await request(app)
      .delete("/api/song/song-002")
      .set(authHeader(token))
      .set("X-Base-Updated-At", "not a date");

    expect(plain.status).toBe(200);
    expect(garbled.status).toBe(200);
  });

  it("should accept a base version newer than the stored one", async () => {
    const { token } = await admin();
    await createSong({ _id: "song-001" });

    const response = await request(app)
      .delete("/api/song/song-001")
      .set(authHeader(token))
      .set("X-Base-Updated-At", FRESH);

    expect(response.status).toBe(200);
  });
});
