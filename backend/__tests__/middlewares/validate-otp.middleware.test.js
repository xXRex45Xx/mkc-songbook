import validateOtp from "../../middlewares/validate-otp.middleware.js";
import OTPModel from "../../models/otp.model.js";
import { ClientFaultError } from "../../utils/error.util.js";

jest.mock("../../models/otp.model.js");

describe("validateOtp middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("successful validation", () => {
    it("should call next() when OTP matches", async () => {
      const mockEmail = "test@example.com";
      const mockOtp = 123456;
      const mockReq = {
        body: {
          email: mockEmail,
          otp: mockOtp.toString(),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: mockOtp,
      });

      await validateOtp(mockReq, mockRes, mockNext);

      expect(OTPModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should handle OTP as string in request body", async () => {
      const mockEmail = "test@example.com";
      const mockOtp = 654321;
      const mockReq = {
        body: {
          email: mockEmail,
          otp: mockOtp.toString(),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: mockOtp,
      });

      await validateOtp(mockReq, mockRes, mockNext);

      expect(OTPModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should compare OTP values correctly", async () => {
      const mockEmail = "user@test.com";
      const mockOtp = 999999;
      const mockReq = {
        body: {
          email: mockEmail,
          otp: "999999",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: 999999,
      });

      await validateOtp(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("invalid OTP", () => {
    it("should throw ClientFaultError when no OTP found for email", async () => {
      const mockEmail = "nonexistent@example.com";
      const mockOtp = 123456;
      const mockReq = {
        body: {
          email: mockEmail,
          otp: mockOtp.toString(),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue(null);

      await expect(validateOtp(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      await expect(validateOtp(mockReq, mockRes, mockNext)).rejects.toThrow(
        "Verification code is invalid."
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ClientFaultError when OTP doesn't match", async () => {
      const mockEmail = "test@example.com";
      const storedOtp = 123456;
      const providedOtp = 654321;
      const mockReq = {
        body: {
          email: mockEmail,
          otp: providedOtp.toString(),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: storedOtp,
      });

      await expect(validateOtp(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      await expect(validateOtp(mockReq, mockRes, mockNext)).rejects.toThrow(
        "Verification code is invalid."
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ClientFaultError when OTP is null", async () => {
      const mockEmail = "test@example.com";
      const mockReq = {
        body: {
          email: mockEmail,
          otp: null,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: 123456,
      });

      await expect(validateOtp(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ClientFaultError when OTP is empty string", async () => {
      const mockEmail = "test@example.com";
      const mockReq = {
        body: {
          email: mockEmail,
          otp: "",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: 123456,
      });

      await expect(validateOtp(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle OTP with leading zeros", async () => {
      const mockEmail = "test@example.com";
      const mockOtp = 123;
      const mockReq = {
        body: {
          email: mockEmail,
          otp: "000123",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: 123,
      });

      await validateOtp(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should handle OTP with different string representations", async () => {
      const mockEmail = "test@example.com";
      const mockOtp = 123456;
      const mockReq = {
        body: {
          email: mockEmail,
          otp: "123456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: 123456,
      });

      await validateOtp(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should not modify request body", async () => {
      const mockEmail = "test@example.com";
      const mockOtp = 123456;
      const mockReq = {
        body: {
          email: mockEmail,
          otp: mockOtp.toString(),
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const originalBody = { ...mockReq.body };

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: mockOtp,
      });

      await validateOtp(mockReq, mockRes, mockNext);

      expect(mockReq.body).toEqual(originalBody);
    });

    it("should handle case where OTP model returns undefined", async () => {
      const mockEmail = "test@example.com";
      const mockReq = {
        body: {
          email: mockEmail,
          otp: "123456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue(undefined);

      await expect(validateOtp(mockReq, mockRes, mockNext)).rejects.toThrow(
        ClientFaultError
      );
    });
  });

  describe("database interaction", () => {
    it("should query OTP model with correct email parameter", async () => {
      const mockEmail = "query@test.com";
      const mockReq = {
        body: {
          email: mockEmail,
          otp: "123456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: 123456,
      });

      await validateOtp(mockReq, mockRes, mockNext);

      expect(OTPModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
    });

    it("should only query once for OTP validation", async () => {
      const mockEmail = "test@example.com";
      const mockReq = {
        body: {
          email: mockEmail,
          otp: "123456",
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      OTPModel.findOne.mockResolvedValue({
        email: mockEmail,
        otp: 123456,
      });

      await validateOtp(mockReq, mockRes, mockNext);

      expect(OTPModel.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
