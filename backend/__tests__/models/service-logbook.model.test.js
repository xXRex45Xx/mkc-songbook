import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import LogBookModel from "../../models/service-logbook.model.js";
import {
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("service logbook model", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("should default cancelled to false", async () => {
    const log = await LogBookModel.create({
      churchName: "Saint Mark",
      serviceDate: new Date("2099-01-01T10:00:00.000Z"),
      songList: ["song-001"],
    });

    expect(log.cancelled).toBe(false);
    expect(log.createdAt).toBeInstanceOf(Date);
    expect(log.updatedAt).toBeInstanceOf(Date);
  });

  it("should require churchName and serviceDate", () => {
    const error = new LogBookModel({ songList: ["song-001"] }).validateSync();

    expect(error.errors.churchName).toBeTruthy();
    expect(error.errors.serviceDate).toBeTruthy();
  });
});
