import checkUserExists from "../../middlewares/check-user-exists.middleware.js";
import UserModel from "../../models/user.model.js";
import { ClientFaultError } from "../../utils/error.util.js";

jest.mock("../../models/user.model.js");

describe("checkUserExists middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("successful validation", () => {
    it("should call next() when user doesn't exist and not forgot password", async () => {
      const mockEmail = "newuser@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue(null);

      await checkUserExists(mockReq, mockRes, mockNext);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() when user exists and forgot password", async () => {
      const mockEmail = "existing@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: true },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue({
        email: mockEmail,
        _id: "user123",
      });

      await checkUserExists(mockReq, mockRes, mockNext);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("user already exists", () => {
    it("should throw ClientFaultError when user exists and not forgot password", async () => {
      const mockEmail = "existing@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue({
        email: mockEmail,
        _id: "user123",
      });

      await expect(checkUserExists(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      await expect(checkUserExists(mockReq, mockRes, mockNext)).rejects.toThrow(
        "User already exists"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ClientFaultError for registration with existing email", async () => {
      const mockEmail = "registered@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: {},
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue({
        email: mockEmail,
        _id: "user123",
      });

      await expect(checkUserExists(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ClientFaultError when user exists with null query", async () => {
      const mockEmail = "existing@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: null,
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue({
        email: mockEmail,
        _id: "user123",
      });

      await expect(checkUserExists(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("user doesn't exist for password reset", () => {
    it("should throw ClientFaultError when user doesn't exist and forgotPassword is true", async () => {
      const mockEmail = "nonexistent@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: true },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue(null);

      await expect(checkUserExists(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      await expect(checkUserExists(mockReq, mockRes, mockNext)).rejects.toThrow(
        "User doesn't exist"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty email string", async () => {
      const mockEmail = "";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue(null);

      await checkUserExists(mockReq, mockRes, mockNext);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: "" });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should handle case-sensitive email lookup", async () => {
      const mockEmail = "User@Example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue(null);

      await checkUserExists(mockReq, mockRes, mockNext);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
    });

    it("should handle user object with minimal properties", async () => {
      const mockEmail = "test@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue({ email: mockEmail });

      await expect(checkUserExists(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
    });

    it("should handle user with undefined forgotPassword", async () => {
      const mockEmail = "existing@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: undefined },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue({
        email: mockEmail,
        _id: "user123",
      });

      await expect(checkUserExists(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
    });
  });

  describe("database interaction", () => {
    it("should query UserModel with correct email parameter", async () => {
      const mockEmail = "db-test@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue(null);

      await checkUserExists(mockReq, mockRes, mockNext);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
    });

    it("should only query once per request", async () => {
      const mockEmail = "test@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue(null);

      await checkUserExists(mockReq, mockRes, mockNext);

      expect(UserModel.findOne).toHaveBeenCalledTimes(1);
    });

    it("should not modify request body", async () => {
      const mockEmail = "test@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const originalBody = { ...mockReq.body };

      UserModel.findOne.mockResolvedValue(null);

      await checkUserExists(mockReq, mockRes, mockNext);

      expect(mockReq.body).toEqual(originalBody);
    });
  });

  describe("behavior verification", () => {
    it("should not modify response object", async () => {
      const mockEmail = "test@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const originalRes = { ...mockRes };

      UserModel.findOne.mockResolvedValue(null);

      await checkUserExists(mockReq, mockRes, mockNext);

      expect(mockRes).toEqual(originalRes);
    });

    it("should handle user with special characters in email", async () => {
      const mockEmail = "user+test@example.com";
      const mockReq = {
        body: { email: mockEmail },
        query: { forgotPassword: false },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      UserModel.findOne.mockResolvedValue(null);

      await checkUserExists(mockReq, mockRes, mockNext);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});
