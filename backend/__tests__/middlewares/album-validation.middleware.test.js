import {
  validateCreateAlbum,
  validateGetAlbum,
  validateUpdateAlbum,
  validateGetAllAlbums,
} from "../../middlewares/album-validation.middleware.js";
import { ClientFaultError } from "../../utils/error.util.js";

describe("album validation middleware", () => {
  describe("validateCreateAlbum", () => {
    it("should call next() with valid album creation data", async () => {
      const mockReq = {
        body: {
          id: "album-001",
          title: "Amazing Songs",
          songs: ["song-001", "song-002"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateAlbum(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should convert string songs to array", async () => {
      const mockReq = {
        body: {
          id: "album-002",
          title: "Single Song Album",
          songs: "song-001",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateAlbum(mockReq, mockRes, mockNext);

      expect(mockReq.body.songs).toEqual(["song-001"]);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id is missing", async () => {
      const mockReq = {
        body: {
          title: "Album without ID",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when id is empty string", async () => {
      const mockReq = {
        body: {
          id: "",
          title: "Album with empty ID",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when title is missing", async () => {
      const mockReq = {
        body: {
          id: "album-003",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when title is too short", async () => {
      const mockReq = {
        body: {
          id: "album-004",
          title: "A",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when title exceeds max length", async () => {
      const mockReq = {
        body: {
          id: "album-005",
          title: "A".repeat(101),
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when songs is missing", async () => {
      const mockReq = {
        body: {
          id: "album-006",
          title: "Album without songs",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when songs is empty array", async () => {
      const mockReq = {
        body: {
          id: "album-007",
          title: "Empty Album",
          songs: [],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when songs array contains empty strings", async () => {
      const mockReq = {
        body: {
          id: "album-008",
          title: "Invalid Songs Album",
          songs: ["song-001", ""],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should accept valid YouTube playlist link", async () => {
      const mockReq = {
        body: {
          id: "album-009",
          title: "YouTube Album",
          playlistLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateAlbum(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should accept empty string for optional playlistLink", async () => {
      const mockReq = {
        body: {
          id: "album-010",
          title: "No Playlist Album",
          playlistLink: "",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateAlbum(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("validateGetAlbum", () => {
    it("should call next() with valid album ID", async () => {
      const mockReq = {
        params: {
          id: "album-123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAlbum(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id is missing", async () => {
      const mockReq = {
        params: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when id is empty string", async () => {
      const mockReq = {
        params: {
          id: "",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateUpdateAlbum", () => {
    it("should call next() with valid album update data", async () => {
      const mockReq = {
        body: {
          id: "album-001",
          title: "Updated Album Title",
          songs: ["song-001", "song-002"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateUpdateAlbum(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when required fields are missing", async () => {
      const mockReq = {
        body: {
          id: "album-001",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdateAlbum(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateGetAllAlbums", () => {
    it("should call next() with no query parameters", async () => {
      const mockReq = {
        query: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllAlbums(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with valid search query", async () => {
      const mockReq = {
        query: {
          q: "amazing",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllAlbums(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with names flag", async () => {
      const mockReq = {
        query: {
          names: true,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllAlbums(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when query exceeds max length", async () => {
      const mockReq = {
        query: {
          q: "a".repeat(101),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllAlbums(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
