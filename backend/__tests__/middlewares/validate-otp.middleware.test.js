import validateOtp from "../../middlewares/validate-otp.middleware.js";
import OTPModel from "../../models/otp.model.js";
import { ClientFaultError } from "../../utils/error.util.js";

jest.mock("../../models/otp.model.js");

describe("validateOtp middleware", () => {
  const buildReq = (otp = "123456") => ({ body: { email: "test@example.com", otp } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() when the code is accepted", async () => {
    OTPModel.verifyCode.mockResolvedValue(true);
    const next = jest.fn();

    await validateOtp(buildReq(), {}, next);

    expect(OTPModel.verifyCode).toHaveBeenCalledWith("test@example.com", "123456");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should pass numeric codes through unchanged", async () => {
    OTPModel.verifyCode.mockResolvedValue(true);

    await validateOtp(buildReq(654321), {}, jest.fn());

    expect(OTPModel.verifyCode).toHaveBeenCalledWith("test@example.com", 654321);
  });

  it("should throw ClientFaultError when the code is rejected", async () => {
    OTPModel.verifyCode.mockResolvedValue(false);
    const next = jest.fn();

    await expect(validateOtp(buildReq(), {}, next)).rejects.toThrow(ClientFaultError);
    await expect(validateOtp(buildReq(), {}, next)).rejects.toThrow(
      "Verification code is invalid."
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should not modify the request body", async () => {
    OTPModel.verifyCode.mockResolvedValue(true);
    const req = buildReq();

    await validateOtp(req, {}, jest.fn());

    expect(req.body).toEqual({ email: "test@example.com", otp: "123456" });
  });
});
