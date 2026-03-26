import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import nodemailer from "nodemailer";

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
});
