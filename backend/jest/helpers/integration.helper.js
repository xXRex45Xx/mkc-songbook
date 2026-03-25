import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

import app from "../../index.js";
import AlbumModel from "../../models/album.model.js";
import OTPModel from "../../models/otp.model.js";
import PlaylistModel from "../../models/playlist.model.js";
import LogBookModel from "../../models/service-logbook.model.js";
import SongModel from "../../models/song.model.js";
import UserModel from "../../models/user.model.js";
import { testUsers } from "../fixtures/users.js";
import { closeDatabase } from "./database.helper.js";

let mongoMemoryServer;

export const ensureDbConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (!mongoMemoryServer) {
    mongoMemoryServer = await MongoMemoryServer.create();
  }

  await mongoose.connect(mongoMemoryServer.getUri());

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connection.asPromise();
  }
};

export const resetDatabase = async () => {
  await ensureDbConnection();

  if (mongoose.connection.readyState !== 1) {
    await mongoose.disconnect().catch(() => {});
    await mongoose.connect(mongoMemoryServer.getUri());
    await mongoose.connection.asPromise();
  }

  await Promise.all([
    OTPModel.deleteMany({}),
    PlaylistModel.deleteMany({}),
    LogBookModel.deleteMany({}),
    AlbumModel.deleteMany({}),
    SongModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);
};

export const teardownDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await closeDatabase();
  }

  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
};

export const createUser = async (overrides = {}) => {
  const password = overrides.password ?? "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  return UserModel.create({
    email: overrides.email ?? `user-${Date.now()}@example.com`,
    name: overrides.name ?? "Test User",
    password: hashedPassword,
    role: overrides.role ?? "public",
    favorites: overrides.favorites ?? [],
    photo: overrides.photo ?? "",
  });
};

export const seedAuthUsers = async () => {
  const publicUser = await createUser(testUsers.public);
  const memberUser = await createUser(testUsers.member);
  const adminUser = await createUser({
    email: "admin-route@mkc.com",
    name: "Admin Route User",
    password: "admin123",
    role: "admin",
  });
  const superAdminUser = await createUser(testUsers.admin);

  return {
    publicUser,
    memberUser,
    adminUser,
    superAdminUser,
  };
};

export const loginUser = async (email, password) => {
  const response = await request(app)
    .post("/api/user/login")
    .send({ email, password });

  return response;
};

export const createSong = async (overrides = {}) => {
  return SongModel.create({
    _id: overrides._id ?? `song-${Date.now()}`,
    title: overrides.title ?? `Song ${Date.now()}`,
    lyrics: overrides.lyrics ?? "Test lyrics",
    musicElements: overrides.musicElements ?? {
      chord: "C",
      tempo: 120,
      rythm: "4/4",
    },
    createdAt: overrides.createdAt ?? "2024",
    updatedAt: overrides.updatedAt ?? new Date(),
    songFilePath:
      Object.prototype.hasOwnProperty.call(overrides, "songFilePath")
        ? overrides.songFilePath
        : null,
    youtubeLink: overrides.youtubeLink ?? null,
    albums: overrides.albums ?? [],
  });
};

export const createAlbum = async (overrides = {}) => {
  return AlbumModel.create({
    _id: overrides._id ?? `album-${Date.now()}`,
    name: overrides.name ?? `Album ${Date.now()}`,
    createdAt: overrides.createdAt ?? "2024",
    photoPath: overrides.photoPath ?? null,
    photoLink: overrides.photoLink ?? null,
    songs: overrides.songs ?? [],
  });
};

export const createPlaylist = async (overrides = {}) => {
  return PlaylistModel.create({
    name: overrides.name ?? `Playlist ${Date.now()}`,
    visibility: overrides.visibility ?? "private",
    creator: overrides.creator,
    songs: overrides.songs ?? [],
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  });
};

export const createOtp = async (overrides = {}) => {
  return OTPModel.create({
    email: overrides.email ?? `otp-${Date.now()}@example.com`,
    otp: overrides.otp ?? 123456,
    createdAt: overrides.createdAt ?? new Date(),
  });
};

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
