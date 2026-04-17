import { checkSongNumberConflict } from "../../middlewares/pre-update-song.middleware.js";
import { ClientFaultError } from "../../utils/error.util.js";
import SongModel from "../../models/song.model.js";

jest.mock("../../models/song.model.js");

describe("checkSongNumberConflict middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() when ID is not changing", async () => {
    const mockReq = {
      body: {
        id: "song-001",
        title: "Updated Title",
      },
      params: {
        id: "song-001",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await checkSongNumberConflict(mockReq, mockRes, mockNext);

    expect(SongModel.findById).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should call next() when no ID conflict exists", async () => {
    const mockReq = {
      body: {
        id: "song-002",
        title: "Updated Title",
      },
      params: {
        id: "song-001",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    SongModel.findById.mockResolvedValue(null);

    await checkSongNumberConflict(mockReq, mockRes, mockNext);

    expect(SongModel.findById).toHaveBeenCalledWith("song-002");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should throw error when song with new ID already exists", async () => {
    const mockReq = {
      body: {
        id: "song-002",
        title: "Updated Title",
      },
      params: {
        id: "song-001",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    SongModel.findById.mockResolvedValue({
      _id: "song-002",
      title: "Existing Song",
    });

    await expect(checkSongNumberConflict(mockReq, mockRes, mockNext)).rejects.toThrow(
      ClientFaultError
    );
    await expect(checkSongNumberConflict(mockReq, mockRes, mockNext)).rejects.toThrow(
      "A song exists with the provided song number."
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call SongModel.findById when ID is changing", async () => {
    const mockReq = {
      body: {
        id: "song-002",
        title: "Updated Title",
      },
      params: {
        id: "song-001",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    SongModel.findById.mockResolvedValue(null);

    await checkSongNumberConflict(mockReq, mockRes, mockNext);

    expect(SongModel.findById).toHaveBeenCalledWith("song-002");
  });

  it("should not call SongModel.findById when IDs are the same", async () => {
    const mockReq = {
      body: {
        id: "song-001",
        title: "Updated Title",
      },
      params: {
        id: "song-001",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await checkSongNumberConflict(mockReq, mockRes, mockNext);

    expect(SongModel.findById).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should handle string vs number ID comparison", async () => {
    const mockReq = {
      body: {
        id: "123",
      },
      params: {
        id: 123,
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await checkSongNumberConflict(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should handle different ID formats", async () => {
    const mockReq = {
      body: {
        id: "song-001",
      },
      params: {
        id: "song-002",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    SongModel.findById.mockResolvedValue(null);

    await checkSongNumberConflict(mockReq, mockRes, mockNext);

    expect(SongModel.findById).toHaveBeenCalledWith("song-001");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should throw error with correct message format", async () => {
    const mockReq = {
      body: {
        id: "existing-song",
      },
      params: {
        id: "different-song",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    SongModel.findById.mockResolvedValue({ _id: "existing-song" });

    await expect(checkSongNumberConflict(mockReq, mockRes, mockNext)).rejects.toThrow(
      "A song exists with the provided song number."
    );
  });

  it("should not modify request object", async () => {
    const mockReq = {
      body: {
        id: "song-002",
        title: "Updated Title",
      },
      params: {
        id: "song-001",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    const originalBody = { ...mockReq.body };
    const originalParams = { ...mockReq.params };

    SongModel.findById.mockResolvedValue(null);

    await checkSongNumberConflict(mockReq, mockRes, mockNext);

    expect(mockReq.body).toEqual(originalBody);
    expect(mockReq.params).toEqual(originalParams);
  });
});
