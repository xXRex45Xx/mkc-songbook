import { describe, expect, it } from "@jest/globals";

import {
  AUDIO_MIMETYPE_MAP,
  IMAGE_MIMETYPE_MAP,
} from "../../utils/mime-type-to-ext.util.js";

describe("mime-type-to-ext util", () => {
  it("should expose the supported image mime types", () => {
    expect(IMAGE_MIMETYPE_MAP).toEqual({
      "image/jpg": "jpg",
      "image/jpeg": "jpg",
      "image/png": "png",
    });
  });

  it("should expose the supported audio mime types", () => {
    expect(AUDIO_MIMETYPE_MAP).toEqual({
      "audio/mpeg": "mp3",
      "audio/aac": "aac",
    });
  });

  it("should leave unsupported mime types unmapped", () => {
    expect(IMAGE_MIMETYPE_MAP["image/gif"]).toBeUndefined();
    expect(AUDIO_MIMETYPE_MAP["audio/wav"]).toBeUndefined();
  });
});
