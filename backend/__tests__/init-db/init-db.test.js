import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import path from "path";

const loadInitDb = ({ SongModel, UserModel, fsModule, moduleDir }) => {
  const modulePath = path.join(process.cwd(), "init-db", "init-db.js");
  const source = fs
    .readFileSync(modulePath, "utf8")
    .replace(/^import .*$/gm, "")
    .replaceAll("import.meta.dirname", JSON.stringify(moduleDir))
    .replace(/export default initDb;\s*$/, "return initDb;");

  return new Function("path", "SongModel", "UserModel", "fs", source)(
    path,
    SongModel,
    UserModel,
    fsModule,
  );
};

describe("initDb", () => {
  let SongModel;
  let UserModel;
  let fsModule;
  let initDb;

  beforeEach(() => {
    SongModel = function SongModel(data) {
      Object.assign(this, data);
    };
    SongModel.countDocuments = jest.fn();
    SongModel.insertMany = jest.fn();

    UserModel = {
      countDocuments: jest.fn(),
      updateOne: jest.fn(),
    };

    fsModule = {
      readFileSync: jest.fn(),
    };

    initDb = loadInitDb({
      SongModel,
      UserModel,
      fsModule,
      moduleDir: path.join(process.cwd(), "init-db"),
    });
  });

  it("should seed songs from the JSON file when the database is empty", async () => {
    SongModel.countDocuments.mockResolvedValue(0);
    UserModel.countDocuments.mockResolvedValue(1);
    fsModule.readFileSync.mockReturnValue(
      JSON.stringify([
        { id: "song-001", name: "Song 1", detail: "Lyrics 1", year: "2024" },
        { id: "song-002", name: "Song 2", detail: "Lyrics 2", year: "2025" },
      ]),
    );

    await initDb({ email: "admin@example.com", name: "Admin", photo: "https://example.com/a.jpg" });

    expect(fsModule.readFileSync).toHaveBeenCalledWith(
      path.join(process.cwd(), "init-db", "final_songs.json"),
    );
    expect(SongModel.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({ _id: "song-001", title: "Song 1", lyrics: "Lyrics 1", createdAt: "2024" }),
      expect.objectContaining({ _id: "song-002", title: "Song 2", lyrics: "Lyrics 2", createdAt: "2025" }),
    ]);
  });

  it("should skip song seeding when songs already exist", async () => {
    SongModel.countDocuments.mockResolvedValue(1);
    UserModel.countDocuments.mockResolvedValue(1);

    await initDb({ email: "admin@example.com", name: "Admin", photo: "https://example.com/a.jpg" });

    expect(fsModule.readFileSync).not.toHaveBeenCalled();
    expect(SongModel.insertMany).not.toHaveBeenCalled();
  });

  it("should upsert the default super-admin only when none exists", async () => {
    SongModel.countDocuments.mockResolvedValue(1);
    UserModel.countDocuments.mockResolvedValueOnce(0).mockResolvedValueOnce(1);

    await initDb({ email: "admin@example.com", name: "Admin", photo: "https://example.com/a.jpg" });

    expect(UserModel.updateOne).toHaveBeenCalledWith(
      { email: "admin@example.com" },
      {
        name: "Admin",
        photo: "https://example.com/a.jpg",
        role: "super-admin",
        email: "admin@example.com",
      },
      { upsert: true },
    );

    UserModel.updateOne.mockClear();
    await initDb({ email: "admin@example.com", name: "Admin", photo: "https://example.com/a.jpg" });

    expect(UserModel.updateOne).not.toHaveBeenCalled();
  });
});
