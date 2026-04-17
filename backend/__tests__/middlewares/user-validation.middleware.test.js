import {
  validateRegisterUser,
  validateRegisterOTP,
  validateLogin,
  validateVerifyOTP,
  validateResetPassword,
  validateGoogleOAuthLogin,
  validateGetAllUsers,
  validateUpdateUserRole,
  validateUpdateFavorites,
} from "../../middlewares/user-validation.middleware.js";
import { ClientFaultError } from "../../utils/error.util.js";
import SongModel from "../../models/song.model.js";

jest.mock("../../models/song.model.js");

describe("user validation middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateRegisterUser", () => {
    it("should call next() with valid registration data", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          name: "John Doe",
          password: "password123",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateRegisterUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when email is missing", async () => {
      const mockReq = {
        body: {
          name: "John Doe",
          password: "password123",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when email is invalid format", async () => {
      const mockReq = {
        body: {
          email: "invalid-email",
          name: "John Doe",
          password: "password123",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when name is missing", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          password: "password123",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when name is too short", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          name: "Jo",
          password: "password123",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when password is missing", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          name: "John Doe",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when password is too short", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          name: "John Doe",
          password: "short",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when OTP is missing", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          name: "John Doe",
          password: "password123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when OTP is not a 6-digit number", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          name: "John Doe",
          password: "password123",
          otp: 12345,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when OTP exceeds 6 digits", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          name: "John Doe",
          password: "password123",
          otp: 1234567,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateRegisterOTP", () => {
    it("should call next() with valid OTP request", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
        },
        query: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateRegisterOTP(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with forgotPassword query", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
        },
        query: {
          forgotPassword: true,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateRegisterOTP(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when email is missing in body", async () => {
      const mockReq = {
        body: {},
        query: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterOTP(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when email is invalid format", async () => {
      const mockReq = {
        body: {
          email: "invalid",
        },
        query: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateRegisterOTP(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateLogin", () => {
    it("should call next() with valid login data", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          password: "password123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when email is missing", async () => {
      const mockReq = {
        body: {
          password: "password123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateLogin(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when password is missing", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateLogin(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when password is too short", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          password: "short",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateLogin(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when email is invalid format", async () => {
      const mockReq = {
        body: {
          email: "invalid-email",
          password: "password123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateLogin(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateVerifyOTP", () => {
    it("should call next() with valid OTP verification", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateVerifyOTP(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when email is missing", async () => {
      const mockReq = {
        body: {
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateVerifyOTP(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when OTP is missing", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateVerifyOTP(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when OTP is not 6 digits", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          otp: 12345,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateVerifyOTP(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateResetPassword", () => {
    it("should call next() with valid password reset data", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          password: "newpassword123",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateResetPassword(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when email is missing", async () => {
      const mockReq = {
        body: {
          password: "newpassword123",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateResetPassword(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when password is missing", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateResetPassword(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when OTP is missing", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          password: "newpassword123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateResetPassword(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when password is too short", async () => {
      const mockReq = {
        body: {
          email: "user@example.com",
          password: "short",
          otp: 123456,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateResetPassword(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateGoogleOAuthLogin", () => {
    it("should call next() with valid access token", async () => {
      const mockReq = {
        body: {
          accessToken: "google-access-token-123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGoogleOAuthLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when access token is missing", async () => {
      const mockReq = {
        body: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGoogleOAuthLogin(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when access token is empty string", async () => {
      const mockReq = {
        body: {
          accessToken: "",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGoogleOAuthLogin(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateGetAllUsers", () => {
    it("should call next() with no query parameters", async () => {
      const mockReq = {
        query: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with valid search query and type", async () => {
      const mockReq = {
        query: {
          q: "john",
          type: "name",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateGetAllUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when q is provided without type", async () => {
      const mockReq = {
        query: {
          q: "john",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllUsers(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when type is invalid", async () => {
      const mockReq = {
        query: {
          q: "john",
          type: "invalid",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllUsers(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when page is less than 1", async () => {
      const mockReq = {
        query: {
          q: "john",
          type: "name",
          page: 0,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateGetAllUsers(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateUpdateUserRole", () => {
    it("should call next() with valid role update data", async () => {
      const mockReq = {
        params: {
          id: "user-123",
        },
        body: {
          role: "admin",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateUpdateUserRole(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id is missing", async () => {
      const mockReq = {
        params: {},
        body: {
          role: "admin",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdateUserRole(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when role is missing", async () => {
      const mockReq = {
        params: {
          id: "user-123",
        },
        body: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdateUserRole(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when role is invalid", async () => {
      const mockReq = {
        params: {
          id: "user-123",
        },
        body: {
          role: "invalid",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdateUserRole(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateUpdateFavorites", () => {
    it("should call next() with valid favorites array", async () => {
      const mockReq = {
        body: {
          favorites: ["song-001", "song-002"],
        },
        user: {
          favorites: [],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      SongModel.find.mockResolvedValue([
        { _id: "song-001" },
        { _id: "song-002" },
      ]);

      await validateUpdateFavorites(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with valid addSongs array", async () => {
      const mockReq = {
        body: {
          addSongs: ["song-001"],
        },
        user: {
          favorites: [],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      SongModel.find.mockResolvedValue([{ _id: "song-001" }]);

      await validateUpdateFavorites(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw error when no valid fields provided", async () => {
      const mockReq = {
        body: {},
        user: {
          favorites: [],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdateFavorites(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when song doesn't exist in favorites", async () => {
      const mockReq = {
        body: {
          favorites: ["nonexistent-song"],
        },
        user: {
          favorites: [],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      SongModel.find.mockResolvedValue([]);

      await expect(validateUpdateFavorites(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      await expect(validateUpdateFavorites(mockReq, mockRes, mockNext)).rejects.toThrow(
        "One or more songs don't exist."
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw error when song already in favorites for addSongs", async () => {
      const mockReq = {
        body: {
          addSongs: ["song-001"],
        },
        user: {
          favorites: ["song-001"],
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await expect(validateUpdateFavorites(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
