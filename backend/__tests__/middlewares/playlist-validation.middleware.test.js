import {
  validateCreatePlaylist,
  validateUpdatePlaylist,
  validatePatchPlaylist,
  validateGetAllPlaylists,
  validateGetPlaylist,
} from "../../middlewares/playlist-validation.middleware.js";
import { ClientFaultError, NotFoundError, ForbiddenError } from "../../utils/error.util.js";
import PlaylistModel from "../../models/playlist.model.js";
import SongModel from "../../models/song.model.js";

jest.mock("../../models/playlist.model.js");
jest.mock("../../models/song.model.js");

describe("playlist validation middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateCreatePlaylist", () => {
    it("should call next() with valid playlist creation data", async () => {
      const mockReq = {
        body: {
          name: "My Playlist",
          visibility: "public",
          songs: ["song-001", "song-002"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreatePlaylist(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should convert string songs to array", async () => {
      const mockReq = {
        body: {
          name: "Single Song Playlist",
          songs: "song-001",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreatePlaylist(mockReq, mockRes, mockNext);

      expect(mockReq.body.songs).toEqual(["song-001"]);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when name is missing", async () => {
      const mockReq = {
        body: {
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreatePlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when name is too short", async () => {
      const mockReq = {
        body: {
          name: "A",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreatePlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when name exceeds max length", async () => {
      const mockReq = {
        body: {
          name: "A".repeat(101),
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreatePlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when songs is missing", async () => {
      const mockReq = {
        body: {
          name: "Songs Missing",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreatePlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should accept valid visibility options", async () => {
      const visibilityOptions = ["private", "members", "public"];

      for (const visibility of visibilityOptions) {
        const mockReq = {
          body: {
            name: "Test Playlist",
            visibility,
            songs: ["song-001"],
          },
        };
        const mockRes = {};
        const mockNext = jest.fn();

        await validateCreatePlaylist(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("validateUpdatePlaylist", () => {
    it("should call next() with valid playlist update data", async () => {
      const mockReq = {
        body: {
          name: "Updated Playlist",
          visibility: "private",
          songs: ["song-001", "song-002"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateUpdatePlaylist(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when name is missing", async () => {
      const mockReq = {
        body: {
          visibility: "private",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdatePlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when visibility is missing", async () => {
      const mockReq = {
        body: {
          name: "No Visibility",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdatePlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when invalid visibility value", async () => {
      const mockReq = {
        body: {
          name: "Invalid Visibility",
          visibility: "invalid",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdatePlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when songs is empty", async () => {
      const mockReq = {
        body: {
          name: "Empty Songs",
          visibility: "public",
          songs: [],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdatePlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validatePatchPlaylist", () => {
    it("should call next() with valid patch data", async () => {
      const mockReq = {
        body: {
          addSongs: ["song-001", "song-002"],
        },
        params: {
          id: "playlist-123",
        },
        user: {
          _id: "user-456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      PlaylistModel.findById.mockResolvedValue({
        _id: "playlist-123",
        creator: "user-456",
        songs: [],
      });

      SongModel.find.mockResolvedValue([
        { _id: "song-001" },
        { _id: "song-002" },
      ]);

      await validatePatchPlaylist(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with removeSongs", async () => {
      const mockReq = {
        body: {
          removeSongs: ["song-001"],
        },
        params: {
          id: "playlist-123",
        },
        user: {
          _id: "user-456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      PlaylistModel.findById.mockResolvedValue({
        _id: "playlist-123",
        creator: "user-456",
        songs: ["song-001"],
      });

      await validatePatchPlaylist(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw NotFoundError when playlist not found", async () => {
      const mockReq = {
        body: {
          addSongs: ["song-001"],
        },
        params: {
          id: "nonexistent",
        },
        user: {
          _id: "user-456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      PlaylistModel.findById.mockResolvedValue(null);

      await expect(validatePatchPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        NotFoundError
      );
      await expect(validatePatchPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        "Playlist not found."
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError when user is not playlist creator", async () => {
      const mockReq = {
        body: {
          addSongs: ["song-001"],
        },
        params: {
          id: "playlist-123",
        },
        user: {
          _id: "different-user",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      PlaylistModel.findById.mockResolvedValue({
        _id: "playlist-123",
        creator: "user-456",
        songs: [],
      });

      await expect(validatePatchPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ForbiddenError
      );
      await expect(validatePatchPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        "You are not authorized to update this playlist"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ClientFaultError when song already in playlist", async () => {
      const mockReq = {
        body: {
          addSongs: ["song-001"],
        },
        params: {
          id: "playlist-123",
        },
        user: {
          _id: "user-456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      PlaylistModel.findById.mockResolvedValue({
        _id: "playlist-123",
        creator: "user-456",
        songs: ["song-001"],
      });

      await expect(validatePatchPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      await expect(validatePatchPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        "One or more songs are already in the playlist."
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ClientFaultError when song doesn't exist", async () => {
      const mockReq = {
        body: {
          addSongs: ["nonexistent-song"],
        },
        params: {
          id: "playlist-123",
        },
        user: {
          _id: "user-456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      PlaylistModel.findById.mockResolvedValue({
        _id: "playlist-123",
        creator: "user-456",
        songs: [],
      });

      SongModel.find.mockResolvedValue([]);

      await expect(validatePatchPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      await expect(validatePatchPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        "One or more songs don't exist."
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should set req.playlist when validation passes", async () => {
      const mockReq = {
        body: {
          addSongs: ["song-001"],
        },
        params: {
          id: "playlist-123",
        },
        user: {
          _id: "user-456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      PlaylistModel.findById.mockResolvedValue({
        _id: "playlist-123",
        creator: "user-456",
        songs: [],
      });

      SongModel.find.mockResolvedValue([{ _id: "song-001" }]);

      await validatePatchPlaylist(mockReq, mockRes, mockNext);

      expect(mockReq.playlist).toBeDefined();
      expect(mockReq.playlist._id).toBe("playlist-123");
    });

    it("should handle patch with only visibility update", async () => {
      const mockReq = {
        body: {
          visibility: "private",
        },
        params: {
          id: "playlist-123",
        },
        user: {
          _id: "user-456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      PlaylistModel.findById.mockResolvedValue({
        _id: "playlist-123",
        creator: "user-456",
        songs: [],
      });

      await validatePatchPlaylist(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("validateGetAllPlaylists", () => {
    it("should call next() with no query parameters", async () => {
      const mockReq = {
        query: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllPlaylists(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with valid search query", async () => {
      const mockReq = {
        query: {
          q: "my playlist",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllPlaylists(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with page parameter", async () => {
      const mockReq = {
        query: {
          page: 1,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllPlaylists(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with myPlaylists flag", async () => {
      const mockReq = {
        query: {
          myPlaylists: true,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllPlaylists(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when page is less than 1", async () => {
      const mockReq = {
        query: {
          page: 0,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllPlaylists(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when query exceeds max length", async () => {
      const mockReq = {
        query: {
          q: "a".repeat(101),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllPlaylists(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateGetPlaylist", () => {
    it("should call next() with valid playlist ID", async () => {
      const mockReq = {
        params: {
          id: "playlist-123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetPlaylist(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id is missing", async () => {
      const mockReq = {
        params: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
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

      await expect(validateGetPlaylist(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
