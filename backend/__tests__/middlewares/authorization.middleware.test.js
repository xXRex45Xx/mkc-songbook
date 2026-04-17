jest.mock("passport", () => {
  const authenticate = jest.fn((strategy, options, callback) => {
    return (req, res, next) => {
      callback(null, {});
    };
  });
  return {
    __esModule: true,
    default: {
      authenticate,
      use: jest.fn(),
    },
  };
});

import passport from "passport";
import roleBasedAuthorization, { optionalAuth } from "../../middlewares/authorization.middleware.js";
import { UnauthorizedError, ForbiddenError } from "../../utils/error.util.js";

describe("roleBasedAuthorization", () => {
  describe("successful authorization", () => {
    it("should call next() when user has role in allowed list", async () => {
      const mockRoles = ["admin", "member"];
      const mockReq = {
        user: { role: "admin" },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() when user role matches one of allowed roles", async () => {
      const mockRoles = ["member", "public"];
      const mockReq = {
        user: { role: "member" },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("unauthorized access", () => {
    it("should throw UnauthorizedError when no user is authenticated", async () => {
      const mockRoles = ["admin"];
      const mockReq = {
        user: null,
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);

      await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
        "You must be logged in to access this resource."
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError when user is undefined", async () => {
      const mockRoles = ["admin"];
      const mockReq = {
        user: undefined,
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);

      await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
        UnauthorizedError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("forbidden access", () => {
    it("should throw ForbiddenError when user role is not in allowed list", async () => {
      const mockRoles = ["admin", "super-admin"];
      const mockReq = {
        user: { role: "member" },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);

      await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
        ForbiddenError
      );
      await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
        "You are not authorized to access this resource."
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError for public role when admin required", async () => {
      const mockRoles = ["admin"];
      const mockReq = {
        user: { role: "public" },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);

      await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
        ForbiddenError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError when user has no role", async () => {
      const mockRoles = ["admin"];
      const mockReq = {
        user: { role: null },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);

      await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
        ForbiddenError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should work with empty roles array", async () => {
      const mockRoles = [];
      const mockReq = {
        user: { role: "admin" },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);

      await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
        ForbiddenError
      );
    });

    it("should work with single role", async () => {
      const mockRoles = ["super-admin"];
      const mockReq = {
        user: { role: "super-admin" },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should handle case-sensitive role matching", async () => {
      const mockRoles = ["Admin"];
      const mockReq = {
        user: { role: "admin" },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = roleBasedAuthorization(mockRoles);

      await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
        ForbiddenError
      );
    });
  });
});

describe("optionalAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call passport.authenticate with correct options", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();

    await optionalAuth(mockReq, mockRes, mockNext);

    expect(passport.authenticate).toHaveBeenCalledWith(
      "jwt",
      { session: false },
      expect.any(Function)
    );
  });

  it("should set req.user when passport.authenticate returns user", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();

    const mockUser = { id: "123", name: "Test User" };
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        callback(null, mockUser);
      };
    });

    await optionalAuth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBe(mockUser);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should not set req.user when passport.authenticate returns null user", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();

    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        callback(null, null);
      };
    });

    await optionalAuth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeUndefined();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should call next() after setting req.user", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();

    const mockUser = { id: "123" };
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        callback(null, mockUser);
      };
    });

    await optionalAuth(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should handle passport.authenticate errors gracefully", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();

    const mockError = new Error("Passport error");
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        callback(mockError, null);
      };
    });

    await optionalAuth(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
