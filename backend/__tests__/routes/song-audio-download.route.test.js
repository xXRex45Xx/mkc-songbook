import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import request from "supertest";

import app from "../../index.js";
import {
  createSong,
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("offline audio download gets the whole file", () => {
  const FILE_SIZE = 1_200_000; // larger than the 500 KB streaming chunk
  let audioPath;

  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
    audioPath = path.join(os.tmpdir(), `song-full-${Date.now()}.mp3`);
    await fs.writeFile(audioPath, Buffer.alloc(FILE_SIZE, 1));
    await createSong({ _id: "song-001", songFilePath: audioPath });
  });

  afterEach(async () => {
    await fs.unlink(audioPath);
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("serves the full file with 200 when no Range header is sent", async () => {
    const response = await request(app)
      .get("/api/song/song-001/audio")
      .buffer(true)
      .parse((res, done) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => done(null, Buffer.concat(chunks)));
      });

    expect(response.status).toBe(200);
    expect(response.headers["accept-ranges"]).toBe("bytes");
    expect(Number(response.headers["content-length"])).toBe(FILE_SIZE);
    expect(response.body.length).toBe(FILE_SIZE);
  });
});
