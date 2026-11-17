import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import OTPLimitModel, {
  MAX_OTP_FAILURES,
  MAX_OTP_REQUESTS,
  OTP_WINDOW_SECONDS,
} from "../../models/otp-limit.model.js";
import {
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("otp limit model", () => {
  const email = "limit@example.com";

  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  describe("claimRequest", () => {
    it("should allow the first requests and refuse the one past the cap", async () => {
      for (let i = 0; i < MAX_OTP_REQUESTS; i++)
        expect(await OTPLimitModel.claimRequest(email)).toBe(true);

      expect(await OTPLimitModel.claimRequest(email)).toBe(false);
      expect((await OTPLimitModel.findOne({ email })).requests).toBe(MAX_OTP_REQUESTS);
    });

    it("should stay at the cap when requests arrive in parallel", async () => {
      const results = await Promise.all(
        Array.from({ length: 20 }, () => OTPLimitModel.claimRequest(email))
      );

      expect(results.filter(Boolean)).toHaveLength(MAX_OTP_REQUESTS);
      expect((await OTPLimitModel.findOne({ email })).requests).toBe(MAX_OTP_REQUESTS);
    });

    it("should refuse a locked email even when it has requests left", async () => {
      await OTPLimitModel.claimRequest(email);
      await OTPLimitModel.updateOne({ email }, { failures: MAX_OTP_FAILURES });

      expect(await OTPLimitModel.claimRequest(email)).toBe(false);
    });

    it("should count one email whatever its letter case", async () => {
      for (let i = 0; i < MAX_OTP_REQUESTS; i++)
        await OTPLimitModel.claimRequest(i % 2 ? "LIMIT@Example.com" : email);

      expect(await OTPLimitModel.claimRequest("Limit@EXAMPLE.com")).toBe(false);
      expect(await OTPLimitModel.countDocuments()).toBe(1);
    });

    it("should keep other emails unaffected", async () => {
      for (let i = 0; i < MAX_OTP_REQUESTS; i++) await OTPLimitModel.claimRequest(email);

      expect(await OTPLimitModel.claimRequest("other@example.com")).toBe(true);
    });

    it("should start a fresh window once the old one has ended", async () => {
      for (let i = 0; i < MAX_OTP_REQUESTS; i++) await OTPLimitModel.claimRequest(email);
      await OTPLimitModel.updateOne({ email }, { failures: MAX_OTP_FAILURES });
      await OTPLimitModel.collection.updateOne(
        { email },
        { $set: { createdAt: new Date(Date.now() - (OTP_WINDOW_SECONDS + 1) * 1000) } }
      );

      expect(await OTPLimitModel.claimRequest(email)).toBe(true);

      const limit = await OTPLimitModel.findOne({ email });
      expect(limit.requests).toBe(1);
      expect(limit.failures).toBe(0);
    });

    it("should not end a window that is still running", async () => {
      for (let i = 0; i < MAX_OTP_REQUESTS; i++) await OTPLimitModel.claimRequest(email);
      await OTPLimitModel.collection.updateOne(
        { email },
        { $set: { createdAt: new Date(Date.now() - (OTP_WINDOW_SECONDS - 60) * 1000) } }
      );

      expect(await OTPLimitModel.claimRequest(email)).toBe(false);
    });
  });

  describe("recordFailure", () => {
    it("should count wrong guesses and report the lock at the cap", async () => {
      await OTPLimitModel.claimRequest(email);

      for (let i = 1; i < MAX_OTP_FAILURES; i++)
        expect(await OTPLimitModel.recordFailure(email)).toBe(false);
      expect(await OTPLimitModel.recordFailure(email)).toBe(true);
      expect((await OTPLimitModel.findOne({ email })).failures).toBe(MAX_OTP_FAILURES);
    });

    it("should do nothing for an email with no counter", async () => {
      expect(await OTPLimitModel.recordFailure(email)).toBe(false);
      expect(await OTPLimitModel.countDocuments()).toBe(0);
    });
  });
});
