import {
  validateGetAllLogBooks,
  validateCreateLogBook,
} from "../../middlewares/service-logbook-validation.middleware.js";
import { ClientFaultError } from "../../utils/error.util.js";

describe("service-logbook-validation middleware", () => {
  describe("validateGetAllLogBooks", () => {
    it("should call next() with no query parameters", async () => {
      const mockReq = {
        query: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllLogBooks(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with valid search query and type", async () => {
      const mockReq = {
        query: {
          q: "church",
          type: "location",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllLogBooks(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with page parameter", async () => {
      const mockReq = {
        query: {
          page: 2,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllLogBooks(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with date search type", async () => {
      const mockReq = {
        query: {
          q: "2024-01-01",
          type: "date",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllLogBooks(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when q is provided without type", async () => {
      const mockReq = {
        query: {
          q: "test",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllLogBooks(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should accept valid type values", async () => {
      const mockReq = {
        query: {
          q: "test",
          type: "location",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllLogBooks(mockReq, mockRes, mockNext);

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

      await expect(validateGetAllLogBooks(mockReq, mockRes, mockNext)).rejects.toThrow(
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

      await expect(validateGetAllLogBooks(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateCreateLogBook", () => {
    it("should call next() with valid logbook creation data", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // 1 day in future
      const mockReq = {
        body: {
          location: "Main Church",
          timestamp: futureDate,
          songs: ["song-001", "song-002"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateLogBook(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when location is missing", async () => {
      const mockReq = {
        body: {
          timestamp: new Date().toISOString(),
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateLogBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when location is too short", async () => {
      const mockReq = {
        body: {
          location: "M",
          timestamp: new Date().toISOString(),
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateLogBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when location exceeds max length", async () => {
      const mockReq = {
        body: {
          location: "A".repeat(101),
          timestamp: new Date().toISOString(),
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateLogBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when timestamp is missing", async () => {
      const mockReq = {
        body: {
          location: "Main Church",
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateLogBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when timestamp is in the past", async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
      const mockReq = {
        body: {
          location: "Main Church",
          timestamp: pastDate,
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateLogBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when songs is missing", async () => {
      const mockReq = {
        body: {
          location: "Main Church",
          timestamp: new Date().toISOString(),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateLogBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when songs is empty array", async () => {
      const mockReq = {
        body: {
          location: "Main Church",
          timestamp: new Date().toISOString(),
          songs: [],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateLogBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when songs array contains empty strings", async () => {
      const mockReq = {
        body: {
          location: "Main Church",
          timestamp: new Date().toISOString(),
          songs: ["song-001", ""],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateCreateLogBook(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should accept valid future timestamp", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // 1 day in future
      const mockReq = {
        body: {
          location: "Future Church",
          timestamp: futureDate,
          songs: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateCreateLogBook(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});
