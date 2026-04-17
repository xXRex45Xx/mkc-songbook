import {
  validateGetAllSongs,
  validateGetSong,
  validateCreateSong,
  validatePatchSong,
} from "../../middlewares/song-validation.middleware.js";
import { ClientFaultError } from "../../utils/error.util.js";

describe("song validation middleware", () => {
  describe("validateGetAllSongs", () => {
    it("should call next() with valid all flag", async () => {
      const mockReq = {
        query: {
          all: true,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllSongs(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with valid search query and type", async () => {
      const mockReq = {
        query: {
          q: "amazing",
          type: "title",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllSongs(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with page and sortBy", async () => {
      const mockReq = {
        query: {
          page: 2,
          sortBy: "A-Z",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllSongs(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when both q and all are provided", async () => {
      const mockReq = {
        query: {
          q: "test",
          all: true,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllSongs(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when q is provided without type", async () => {
      const mockReq = {
        query: {
          q: "test",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllSongs(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when type is invalid", async () => {
      const mockReq = {
        query: {
          q: "test",
          type: "invalid",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllSongs(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when page is less than 1", async () => {
      const mockReq = {
        query: {
          all: true,
          page: 0,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllSongs(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when sortBy is invalid", async () => {
      const mockReq = {
        query: {
          all: true,
          sortBy: "Invalid",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllSongs(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should accept all valid search types", async () => {
      const searchTypes = ["all", "title", "lyrics", "id"];

      for (const type of searchTypes) {
        const mockReq = {
          query: {
            q: "test",
            type,
          },
        };
        const mockRes = {};
        const mockNext = jest.fn();

        await validateGetAllSongs(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(1);
      }
    });

    it("should accept all valid sortBy options", async () => {
      const sortOptions = ["A-Z", "Number", "Recently Added"];

      for (const sortBy of sortOptions) {
        const mockReq = {
          query: {
            all: true,
            sortBy,
          },
        };
        const mockRes = {};
        const mockNext = jest.fn();

        await validateGetAllSongs(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("validateGetSong", () => {
    it("should call next() with valid song ID", async () => {
      const mockReq = {
        params: {
          id: "song-123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetSong(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id is missing", async () => {
      const mockReq = {
        params: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetSong(mockReq, mockRes, mockNext)).rejects.toThrow(
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

      await expect(validateGetSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateCreateSong", () => {
    it("should call next() with valid song creation data", async () => {
      const mockReq = {
        body: {
          id: "song-001",
          title: "Amazing Grace",
          lyrics: "Amazing grace how sweet the sound",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateSong(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should accept optional musical elements", async () => {
      const mockReq = {
        body: {
          id: "song-002",
          title: "With Chords",
          lyrics: "Some lyrics",
          chord: "C G Am F",
          tempo: 120,
          rythm: "4/4",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateSong(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should accept YouTube video link", async () => {
      const mockReq = {
        body: {
          id: "song-003",
          title: "With Video",
          lyrics: "Some lyrics",
          "video-link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateSong(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id is missing", async () => {
      const mockReq = {
        body: {
          title: "No ID Song",
          lyrics: "Some lyrics",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when title is missing", async () => {
      const mockReq = {
        body: {
          id: "song-004",
          lyrics: "Some lyrics",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when title is too short", async () => {
      const mockReq = {
        body: {
          id: "song-005",
          title: "A",
          lyrics: "Some lyrics",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when title exceeds max length", async () => {
      const mockReq = {
        body: {
          id: "song-006",
          title: "A".repeat(101),
          lyrics: "Some lyrics",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when lyrics is missing", async () => {
      const mockReq = {
        body: {
          id: "song-007",
          title: "No Lyrics Song",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when lyrics is too short", async () => {
      const mockReq = {
        body: {
          id: "song-008",
          title: "Short Lyrics",
          lyrics: "A",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when lyrics exceeds max length", async () => {
      const mockReq = {
        body: {
          id: "song-009",
          title: "Long Lyrics",
          lyrics: "A".repeat(50001),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when tempo is negative", async () => {
      const mockReq = {
        body: {
          id: "song-010",
          title: "Negative Tempo",
          lyrics: "Some lyrics",
          tempo: -1,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when tempo is not an integer", async () => {
      const mockReq = {
        body: {
          id: "song-011",
          title: "Float Tempo",
          lyrics: "Some lyrics",
          tempo: 120.5,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when chord exceeds max length", async () => {
      const mockReq = {
        body: {
          id: "song-012",
          title: "Long Chord",
          lyrics: "Some lyrics",
          chord: "A".repeat(11),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when rythm is too short", async () => {
      const mockReq = {
        body: {
          id: "song-013",
          title: "Short Rythm",
          lyrics: "Some lyrics",
          rythm: "4",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when rythm exceeds max length", async () => {
      const mockReq = {
        body: {
          id: "song-014",
          title: "Long Rythm",
          lyrics: "Some lyrics",
          rythm: "A".repeat(51),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should accept empty string for optional fields", async () => {
      const mockReq = {
        body: {
          id: "song-015",
          title: "Empty Optional",
          lyrics: "Some lyrics",
          chord: "",
          rythm: "",
          "video-link": "",
          albums: "",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateSong(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("validatePatchSong", () => {
    it("should call next() with valid video-link", async () => {
      const mockReq = {
        body: {
          "video-link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validatePatchSong(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should accept empty string for video-link", async () => {
      const mockReq = {
        body: {
          "video-link": "",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validatePatchSong(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when video-link is invalid URL", async () => {
      const mockReq = {
        body: {
          "video-link": "not-a-url",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validatePatchSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when video-link is not a YouTube URL", async () => {
      const mockReq = {
        body: {
          "video-link": "https://www.google.com",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validatePatchSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when the patch body is missing", async () => {
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validatePatchSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when the patch body is null", async () => {
      const mockReq = {
        body: null,
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validatePatchSong(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
