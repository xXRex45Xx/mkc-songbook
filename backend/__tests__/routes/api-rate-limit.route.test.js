import { describe, expect, it } from "@jest/globals";

import app from "../../index.js";
import {
  apiRateLimiter,
  audioRateLimiter,
} from "../../middlewares/rate-limit.middleware.js";
import { csrfProtection } from "../../middlewares/csrf.middleware.js";

describe("api rate limit wiring", () => {
  it("should mount the generic rate limiter on /api", () => {
    const handles = app._router.stack.map((layer) => layer.handle);

    expect(handles).toContain(apiRateLimiter);
  });

  it("should mount the audio rate limiter on /api", () => {
    const handles = app._router.stack.map((layer) => layer.handle);

    expect(handles).toContain(audioRateLimiter);
  });

  it("should mount CSRF protection on /api", () => {
    const handles = app._router.stack.map((layer) => layer.handle);

    expect(handles).toContain(csrfProtection);
  });
});
