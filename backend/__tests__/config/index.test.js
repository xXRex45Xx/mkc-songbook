import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import request from "supertest";
import { MulterError } from "multer";

import app, { shouldCompress } from "../../index.js";

describe("app bootstrap and error handling", () => {
  const errorHandler = app._router.stack[app._router.stack.length - 1].handle;
  const staticDir = path.join(process.cwd(), "uploads", "images", "albums");
  const staticFile = path.join(staticDir, "index-test.txt");

  beforeAll(() => {
    app.get("/__compression-test__", (_req, res) => {
      res.status(200).json({ message: "x".repeat(2048) });
    });
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await fsPromises.rm(staticFile, { force: true });
  });

  it("should return a generic message for server errors", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await errorHandler(new Error("boom"), req, res, jest.fn());

    expect(req.error).toBeInstanceOf(Error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "An unexpected error occurred." });
  });

  it("should map Multer limit errors to 400", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const error = new MulterError("LIMIT_FILE_SIZE", "audio-file");

    await errorHandler(error, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });

  it("should delete an uploaded file when handling an error", async () => {
    const unlinkSpy = jest.spyOn(fs, "unlink").mockImplementation((_path, callback) => callback(null));
    const req = {
      file: { path: "/tmp/test-upload.mp3" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await errorHandler(new Error("boom"), req, res, jest.fn());

    expect(unlinkSpy).toHaveBeenCalledWith("/tmp/test-upload.mp3", expect.any(Function));
  });

  it("should capture uploaded file cleanup failures on the request", async () => {
    jest.spyOn(fs, "unlink").mockImplementation((_path, callback) => callback(new Error("unlink failed")));
    const req = {
      file: { path: "/tmp/test-upload.mp3" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await errorHandler(new Error("boom"), req, res, jest.fn());

    expect(req.fileDeleteError).toBeInstanceOf(Error);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("should log internal server errors on the request while returning a generic message", async () => {
    const internalError = new Error("db failure");
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await errorHandler({ message: "wrapper", internalError }, req, res, jest.fn());

    expect(req.error).toBe(internalError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "An unexpected error occurred." });
  });

  it("should serve static album files with cross-origin headers", async () => {
    await fsPromises.mkdir(staticDir, { recursive: true });
    await fsPromises.writeFile(staticFile, "album image test");

    const response = await request(app).get("/static/albums/images/index-test.txt");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(response.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });

  it("should respond to CORS preflight requests for allowed origins", async () => {
    const response = await request(app)
      .options("/api/song")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("should gzip compress eligible JSON responses when requested", async () => {
    const response = await request(app)
      .get("/__compression-test__")
      .set("Accept-Encoding", "gzip");

    expect(response.status).toBe(200);
    expect(response.headers["content-encoding"]).toBe("gzip");
    expect(response.headers.vary).toContain("Accept-Encoding");
  });

  it("should skip compression for audio streaming routes", () => {
    const req = {
      path: "/api/song/song-001/audio",
      headers: {},
    };
    const res = {
      getHeader: jest.fn().mockReturnValue("audio/mpeg"),
    };

    expect(shouldCompress(req, res)).toBe(false);
  });
});
