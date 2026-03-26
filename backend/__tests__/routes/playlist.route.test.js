import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

import app from "../../index.js";
import PlaylistModel from "../../models/playlist.model.js";
import {
  authHeader,
  createPlaylist,
  createSong,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("playlist routes", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  describe("GET /api/playlist", () => {
    it("should return only public playlists to anonymous users", async () => {
      const { memberUser } = await seedAuthUsers();
      await createPlaylist({ name: "Public Playlist", visibility: "public", creator: memberUser._id });
      await createPlaylist({ name: "Members Playlist", visibility: "members", creator: memberUser._id });

      const response = await request(app).get("/api/playlist");

      expect(response.status).toBe(200);
      expect(response.body.playlists).toHaveLength(1);
      expect(response.body.playlists[0].name).toBe("Public Playlist");
    });

    it("should return member-visible playlists to a member", async () => {
      const { memberUser } = await seedAuthUsers();
      await createPlaylist({ name: "Public Playlist", visibility: "public", creator: memberUser._id });
      await createPlaylist({ name: "Members Playlist", visibility: "members", creator: memberUser._id });
      await createPlaylist({ name: "Private Playlist", visibility: "private", creator: memberUser._id });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get("/api/playlist")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.playlists).toHaveLength(3);
    });

    it("should reject myPlaylists for anonymous users", async () => {
      const response = await request(app).get("/api/playlist?myPlaylists=true");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You need to login first.");
    });

    it("should return only the current user's playlists when myPlaylists=true", async () => {
      const { memberUser, publicUser } = await seedAuthUsers();
      await createPlaylist({ name: "Mine", creator: memberUser._id, songs: [] });
      await createPlaylist({ name: "Not Mine", creator: publicUser._id, songs: [] });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get("/api/playlist?myPlaylists=true")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe("Mine");
    });

    it("should search playlists by name", async () => {
      const { memberUser } = await seedAuthUsers();
      await createPlaylist({ name: "Practice Songs", visibility: "public", creator: memberUser._id });
      await createPlaylist({ name: "Service Set", visibility: "public", creator: memberUser._id });

      const response = await request(app).get("/api/playlist?q=Practice");

      expect(response.status).toBe(200);
      expect(response.body.playlists).toHaveLength(1);
      expect(response.body.playlists[0].name).toBe("Practice Songs");
    });
  });

  describe("GET /api/playlist/:id", () => {
    it("should return a public playlist to anonymous users", async () => {
      const { memberUser } = await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const playlist = await createPlaylist({
        name: "Public Playlist",
        visibility: "public",
        creator: memberUser._id,
        songs: ["song-001"],
      });

      const response = await request(app).get(`/api/playlist/${playlist._id}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Public Playlist");
    });

    it("should allow the owner to view a private playlist", async () => {
      const { memberUser } = await seedAuthUsers();
      const playlist = await createPlaylist({
        name: "Private Playlist",
        visibility: "private",
        creator: memberUser._id,
      });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .get(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Private Playlist");
    });

    it("should hide a private playlist from non-owners", async () => {
      const { memberUser, publicUser } = await seedAuthUsers();
      const playlist = await createPlaylist({
        name: "Private Playlist",
        visibility: "private",
        creator: memberUser._id,
      });
      const loginResponse = await loginUser(publicUser.email, "public123");

      const response = await request(app)
        .get(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Playlist not found");
    });

    it("should hide a members playlist from a public user", async () => {
      const { memberUser, publicUser } = await seedAuthUsers();
      const playlist = await createPlaylist({
        name: "Members Playlist",
        visibility: "members",
        creator: memberUser._id,
      });
      const loginResponse = await loginUser(publicUser.email, "public123");

      const response = await request(app)
        .get(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Playlist not found");
    });

    it("should hide a members playlist from anonymous users", async () => {
      const { memberUser } = await seedAuthUsers();
      const playlist = await createPlaylist({
        name: "Members Playlist",
        visibility: "members",
        creator: memberUser._id,
      });

      const response = await request(app).get(`/api/playlist/${playlist._id}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Playlist not found");
    });

    it("should return 404 when the playlist does not exist", async () => {
      const response = await request(app).get("/api/playlist/507f1f77bcf86cd799439011");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Playlist not found");
    });
  });

  describe("POST /api/playlist", () => {
    it("should create a playlist for an authenticated user", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .post("/api/playlist")
        .set(authHeader(loginResponse.body.token))
        .send({ name: "Practice Songs", visibility: "private", songs: ["song-001"] });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("insertedId");
      expect(await PlaylistModel.findById(response.body.insertedId)).toBeTruthy();
    });

    it("should reject unauthenticated playlist creation", async () => {
      const response = await request(app)
        .post("/api/playlist")
        .send({ name: "Practice Songs", visibility: "private", songs: [] });

      expect(response.status).toBe(401);
    });

    it("should reject missing song references when creating a playlist", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .post("/api/playlist")
        .set(authHeader(loginResponse.body.token))
        .send({ name: "Practice Songs", visibility: "private", songs: ["song-404"] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("The following songs don't exist: song-404");
    });

    it("should reject members-only playlist creation for public users", async () => {
      const { publicUser } = await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const loginResponse = await loginUser(publicUser.email, "public123");

      const response = await request(app)
        .post("/api/playlist")
        .set(authHeader(loginResponse.body.token))
        .send({ name: "Members Playlist", visibility: "members", songs: ["song-001"] });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "You have to be a choir member to create members only playlist.",
      );
    });

    it("should default playlist visibility to private when omitted", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .post("/api/playlist")
        .set(authHeader(loginResponse.body.token))
        .send({ name: "Practice Songs", songs: ["song-001"] });

      expect(response.status).toBe(201);
      expect((await PlaylistModel.findById(response.body.insertedId)).visibility).toBe("private");
    });
  });

  describe("PUT /api/playlist/:id", () => {
    it("should let the owner update a playlist", async () => {
      const { memberUser } = await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const playlist = await createPlaylist({ creator: memberUser._id, songs: ["song-001"] });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .put(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token))
        .send({ name: "Updated Playlist", visibility: "public", songs: ["song-001"] });

      expect(response.status).toBe(200);
      expect((await PlaylistModel.findById(playlist._id)).name).toBe("Updated Playlist");
    });

    it("should reject updates from non-owners", async () => {
      const { memberUser, publicUser } = await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const playlist = await createPlaylist({ creator: memberUser._id, songs: ["song-001"] });
      const loginResponse = await loginUser(publicUser.email, "public123");

      const response = await request(app)
        .put(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token))
        .send({ name: "Updated Playlist", visibility: "public", songs: ["song-001"] });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You are not authorized to update this playlist");
    });

    it("should reject unauthenticated updates", async () => {
      const response = await request(app)
        .put("/api/playlist/507f1f77bcf86cd799439011")
        .send({ name: "Updated Playlist", visibility: "public", songs: ["song-001"] });

      expect(response.status).toBe(401);
    });

    it("should return 404 when updating a missing playlist", async () => {
      await seedAuthUsers();
      await createSong({ _id: "song-001" });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .put("/api/playlist/507f1f77bcf86cd799439011")
        .set(authHeader(loginResponse.body.token))
        .send({ name: "Updated Playlist", visibility: "public", songs: ["song-001"] });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Playlist not found");
    });
  });

  describe("PATCH /api/playlist/:id", () => {
    it("should patch playlist visibility and songs for the owner", async () => {
      const { memberUser } = await seedAuthUsers();
      await createSong({ _id: "song-001" });
      await createSong({ _id: "song-002" });
      const playlist = await createPlaylist({ creator: memberUser._id, songs: ["song-001"] });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .patch(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token))
        .send({ visibility: "public", addSongs: ["song-002"], removeSongs: ["song-001"] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ updated: true });
      const updatedPlaylist = await PlaylistModel.findById(playlist._id);
      expect(updatedPlaylist.visibility).toBe("public");
      expect(updatedPlaylist.songs).toEqual(["song-002"]);
    });

    it("should reject patch updates from non-owners", async () => {
      const { memberUser, publicUser } = await seedAuthUsers();
      const playlist = await createPlaylist({ creator: memberUser._id, songs: [] });
      const loginResponse = await loginUser(publicUser.email, "public123");

      const response = await request(app)
        .patch(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token))
        .send({ visibility: "public" });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You are not authorized to update this playlist");
    });

    it("should reject unauthenticated patch updates", async () => {
      const response = await request(app)
        .patch("/api/playlist/507f1f77bcf86cd799439011")
        .send({ visibility: "public" });

      expect(response.status).toBe(401);
    });

    it("should return 404 when patching a missing playlist", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .patch("/api/playlist/507f1f77bcf86cd799439011")
        .set(authHeader(loginResponse.body.token))
        .send({ visibility: "public" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Playlist not found.");
    });

    it("should reject adding songs that do not exist", async () => {
      const { memberUser } = await seedAuthUsers();
      const playlist = await createPlaylist({ creator: memberUser._id, songs: [] });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .patch(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token))
        .send({ addSongs: ["song-404"] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("One or more songs don't exist.");
    });
  });

  describe("DELETE /api/playlist/:id", () => {
    it("should let the owner delete a playlist", async () => {
      const { memberUser } = await seedAuthUsers();
      const playlist = await createPlaylist({ creator: memberUser._id, songs: [] });
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .delete(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ deleted: true });
      expect(await PlaylistModel.findById(playlist._id)).toBeNull();
    });

    it("should reject deletes from non-owners", async () => {
      const { memberUser, publicUser } = await seedAuthUsers();
      const playlist = await createPlaylist({ creator: memberUser._id, songs: [] });
      const loginResponse = await loginUser(publicUser.email, "public123");

      const response = await request(app)
        .delete(`/api/playlist/${playlist._id}`)
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You are not authorized to delete this playlist");
    });

    it("should reject unauthenticated deletes", async () => {
      const response = await request(app).delete("/api/playlist/507f1f77bcf86cd799439011");

      expect(response.status).toBe(401);
    });

    it("should return 404 when deleting a missing playlist", async () => {
      await seedAuthUsers();
      const loginResponse = await loginUser("member@mkc.com", "member123");

      const response = await request(app)
        .delete("/api/playlist/507f1f77bcf86cd799439011")
        .set(authHeader(loginResponse.body.token));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Playlist not found");
    });
  });
});
