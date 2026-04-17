import { describe, expect, it } from "@jest/globals";

import apiRouter from "../../routes/index.js";

describe("api router", () => {
  it("should mount the main resource routers", () => {
    const mountedPaths = apiRouter.stack
      .filter((layer) => layer.route === undefined && layer.name === "router")
      .map((layer) => layer.regexp.toString());

    expect(mountedPaths.join(" ")).toContain("song");
    expect(mountedPaths.join(" ")).toContain("user");
    expect(mountedPaths.join(" ")).toContain("album");
    expect(mountedPaths.join(" ")).toContain("logbook");
    expect(mountedPaths.join(" ")).toContain("playlist");
  });
});
