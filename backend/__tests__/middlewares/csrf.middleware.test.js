import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { csrfProtection } from "../../middlewares/csrf.middleware.js";
import { ForbiddenError } from "../../utils/error.util.js";

const buildReq = ({ method = "POST", headers = {}, cookies = {} } = {}) => ({
  method,
  headers: Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])),
  cookies,
  get(name) {
    return this.headers[name.toLowerCase()];
  },
});

describe("csrfProtection", () => {
  let next;

  beforeEach(() => {
    process.env.ALLOWED_ORIGINS = "http://localhost:3000";
    next = jest.fn();
  });

  it("should let safe methods through", () => {
    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      const next = jest.fn();
      csrfProtection(buildReq({ method, cookies: { mkc_at: "x" } }), {}, next);
      expect(next).toHaveBeenCalledWith();
    }
  });

  it("should reject a post with a session cookie and no header", () => {
    csrfProtection(buildReq({ cookies: { mkc_at: "x" } }), {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it("should reject a post with only a refresh cookie and no header", () => {
    csrfProtection(buildReq({ cookies: { mkc_rt: "x" } }), {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it("should reject a header with the wrong value", () => {
    const req = buildReq({ cookies: { mkc_at: "x" }, headers: { "X-Requested-With": "other" } });

    csrfProtection(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it("should accept a post with a session cookie and the header", () => {
    const req = buildReq({ cookies: { mkc_at: "x" }, headers: { "X-Requested-With": "mkc" } });

    csrfProtection(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should accept a post with no session cookie", () => {
    csrfProtection(buildReq(), {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should accept a post that carries an Authorization header", () => {
    const req = buildReq({
      cookies: { mkc_at: "x" },
      headers: { Authorization: "Bearer legacy" },
    });

    csrfProtection(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should reject an Origin that is not allowed, even with the header", () => {
    const req = buildReq({
      cookies: { mkc_at: "x" },
      headers: { Origin: "https://evil.example", "X-Requested-With": "mkc" },
    });

    csrfProtection(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it("should accept an allowed Origin written with a trailing slash", () => {
    const req = buildReq({
      cookies: { mkc_at: "x" },
      headers: { Origin: "http://localhost:3000/", "X-Requested-With": "mkc" },
    });

    csrfProtection(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });
});
