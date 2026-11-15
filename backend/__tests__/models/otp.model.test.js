import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import nodemailer from "nodemailer";

import OTPLimitModel, { MAX_OTP_FAILURES } from "../../models/otp-limit.model.js";
import OTPModel from "../../models/otp.model.js";
import {
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("otp model", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("should send an email from the pre-save hook", async () => {
    const transporter = nodemailer.createTransport.mock.results[0].value;

    const otp = await OTPModel.create({ email: "otp@example.com", otp: 123456 });

    expect(otp.createdAt).toBeInstanceOf(Date);
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: process.env.SMTP_USER,
      to: "otp@example.com",
      subject: "MKC-Choir Email Verification",
      text: "Your verification code is 123456",
    });
  });

  it("should enforce unique email addresses", async () => {
    await OTPModel.create({ email: "otp@example.com", otp: 123456 });

    await expect(OTPModel.create({ email: "otp@example.com", otp: 654321 })).rejects.toThrow();
  });

  describe("verifyCode", () => {
    const email = "guess@example.com";

    it("should accept the right code", async () => {
      await OTPModel.create({ email, otp: 123456 });

      expect(await OTPModel.verifyCode(email, "123456")).toBe(true);
      expect(await OTPModel.verifyCode(email, 123456)).toBe(true);
    });

    it("should count each wrong guess and keep the entry until the fifth", async () => {
      await OTPModel.create({ email, otp: 123456 });

      for (let i = 1; i <= 4; i++) {
        expect(await OTPModel.verifyCode(email, 111111)).toBe(false);
        expect((await OTPModel.findOne({ email })).attempts).toBe(i);
      }
      expect(await OTPModel.verifyCode(email, 123456)).toBe(true);
    });

    it("should delete the entry on the fifth wrong guess", async () => {
      await OTPModel.create({ email, otp: 123456 });

      for (let i = 0; i < 5; i++) await OTPModel.verifyCode(email, 111111);

      expect(await OTPModel.findOne({ email })).toBeNull();
      expect(await OTPModel.verifyCode(email, 123456)).toBe(false);
    });

    it("should count wrong guesses against the email across codes", async () => {
      await OTPLimitModel.claimRequest(email);
      await OTPModel.create({ email, otp: 123456 });
      for (let i = 0; i < 5; i++) await OTPModel.verifyCode(email, 111111);
      await OTPModel.create({ email, otp: 654321 });
      await OTPModel.verifyCode(email, 111111);

      expect((await OTPLimitModel.findOne({ email })).failures).toBe(6);
    });

    it("should delete the entry once the email reaches its failure cap", async () => {
      await OTPLimitModel.claimRequest(email);
      await OTPLimitModel.updateOne({ email }, { failures: MAX_OTP_FAILURES - 1 });
      await OTPModel.create({ email, otp: 123456 });

      expect(await OTPModel.verifyCode(email, 111111)).toBe(false);

      expect(await OTPModel.findOne({ email })).toBeNull();
      expect(await OTPModel.verifyCode(email, 123456)).toBe(false);
    });

    it("should stay at five attempts when guesses arrive in parallel", async () => {
      await OTPModel.create({ email, otp: 123456 });

      const results = await Promise.all(
        Array.from({ length: 20 }, (_, i) => OTPModel.verifyCode(email, 200000 + i))
      );

      expect(results.every((accepted) => accepted === false)).toBe(true);
      expect(await OTPModel.findOne({ email })).toBeNull();
      expect(await OTPModel.verifyCode(email, 123456)).toBe(false);
    });

    it("should treat an entry created before attempts existed as having none", async () => {
      await OTPModel.collection.insertOne({ email, otp: 123456, createdAt: new Date() });

      expect(await OTPModel.verifyCode(email, 111111)).toBe(false);
      expect((await OTPModel.findOne({ email })).attempts).toBe(1);
      expect(await OTPModel.verifyCode(email, 123456)).toBe(true);
    });

    it("should reject a missing entry and a malformed code without throwing", async () => {
      expect(await OTPModel.verifyCode("none@example.com", 123456)).toBe(false);
      expect(await OTPModel.verifyCode(email, "abc")).toBe(false);
    });
  });
});
