import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  addLog,
  getAllOrSearchLogBook,
} from "../../controllers/service-logbook.controller.js";
import LogBookModel from "../../models/service-logbook.model.js";

describe("service logbook controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should query by location when type is location", async () => {
    const entries = [{ _id: "log-001", churchName: "Saint Mark" }];
    const listQuery = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue(entries) };
    const countQuery = { countDocuments: jest.fn().mockResolvedValue(1) };
    LogBookModel.find = jest.fn((query, projection) => {
      if (projection) {
        return listQuery;
      }

      return countQuery;
    });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllOrSearchLogBook({ query: { q: "Mark", type: "location", page: 1 } }, res);

    expect(LogBookModel.find).toHaveBeenNthCalledWith(
      1,
      { churchName: { $regex: /Mark/i } },
      { songList: false },
    );
    expect(res.json).toHaveBeenCalledWith({ logBook: entries, totalPages: 1 });
  });

  it("should query by date when type is date", async () => {
    const entries = [{ _id: "log-001", churchName: "Saint Mark" }];
    const listQuery = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue(entries) };
    const countQuery = { countDocuments: jest.fn().mockResolvedValue(1) };
    LogBookModel.find = jest.fn((query, projection) => {
      if (projection) {
        return listQuery;
      }

      return countQuery;
    });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllOrSearchLogBook(
      { query: { q: "2099-01-01T10:00:00.000Z", type: "date", page: 1 } },
      res,
    );

    expect(LogBookModel.find).toHaveBeenNthCalledWith(
      1,
      { serviceDate: "2099-01-01T10:00:00.000Z" },
      { songList: false },
    );
  });

  it("should return paginated logs without a search query", async () => {
    const entries = [{ _id: "log-001", churchName: "Saint Mark" }];
    const listQuery = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue(entries) };
    const countQuery = { countDocuments: jest.fn().mockResolvedValue(1) };
    LogBookModel.find = jest.fn((query, projection) => {
      if (projection) {
        return listQuery;
      }

      return countQuery;
    });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllOrSearchLogBook({ query: { page: 2 } }, res);

    expect(LogBookModel.find).toHaveBeenNthCalledWith(1, {}, { songList: false });
    expect(listQuery.skip).toHaveBeenCalledWith(100);
    expect(res.json).toHaveBeenCalledWith({ logBook: entries, totalPages: 1 });
  });

  it("should create log entries from request payload fields", async () => {
    LogBookModel.create = jest.fn().mockResolvedValue({ _id: "log-001" });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addLog(
      {
        body: {
          location: "Saint Mark",
          timestamp: "2099-01-01T10:00:00.000Z",
          songs: ["song-001"],
        },
      },
      res,
    );

    expect(LogBookModel.create).toHaveBeenCalledWith({
      churchName: "Saint Mark",
      serviceDate: "2099-01-01T10:00:00.000Z",
      songList: ["song-001"],
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
