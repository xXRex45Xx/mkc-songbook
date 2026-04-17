import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import SearchHistoryModel from "../../models/search-history.model.js";
import {
  createUser,
  ensureDbConnection,
  resetDatabase,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("search history model", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("should default timestamp when saving", async () => {
    const user = await createUser();
    const searchHistory = await SearchHistoryModel.create({
      userId: user._id,
      searchTerm: "grace",
      resultCount: 3,
    });

    expect(searchHistory.timestamp).toBeInstanceOf(Date);
  });

  it("should require userId, searchTerm, and resultCount", () => {
    const error = new SearchHistoryModel({}).validateSync();

    expect(error.errors.userId).toBeTruthy();
    expect(error.errors.searchTerm).toBeTruthy();
    expect(error.errors.resultCount).toBeTruthy();
  });
});
