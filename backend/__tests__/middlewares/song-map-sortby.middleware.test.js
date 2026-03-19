import mapSongSortBy from "../../middlewares/song-map-sortby.middleware.js";

describe("mapSongSortBy middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should map 'A-Z' to 'title'", async () => {
    const mockReq = {
      query: {
        sortBy: "A-Z",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockReq.query.sortBy).toBe("title");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should map 'Recently Added' to 'createdAt'", async () => {
    const mockReq = {
      query: {
        sortBy: "Recently Added",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockReq.query.sortBy).toBe("createdAt");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should default to '_id' for unknown values", async () => {
    const mockReq = {
      query: {
        sortBy: "Unknown",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockReq.query.sortBy).toBe("_id");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should default to '_id' when sortBy is undefined", async () => {
    const mockReq = {
      query: {},
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockReq.query.sortBy).toBe("_id");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should default to '_id' when sortBy is null", async () => {
    const mockReq = {
      query: {
        sortBy: null,
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockReq.query.sortBy).toBe("_id");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should default to '_id' when sortBy is empty string", async () => {
    const mockReq = {
      query: {
        sortBy: "",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockReq.query.sortBy).toBe("_id");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should handle case-sensitive sorting", async () => {
    const mockReq = {
      query: {
        sortBy: "a-z",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockReq.query.sortBy).toBe("_id");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should not modify other query parameters", async () => {
    const mockReq = {
      query: {
        sortBy: "A-Z",
        q: "test",
        page: 1,
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockReq.query.sortBy).toBe("title");
    expect(mockReq.query.q).toBe("test");
    expect(mockReq.query.page).toBe(1);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should handle all valid sortBy options", async () => {
    const testCases = [
      { input: "A-Z", expected: "title" },
      { input: "Recently Added", expected: "createdAt" },
      { input: undefined, expected: "_id" },
      { input: null, expected: "_id" },
      { input: "", expected: "_id" },
      { input: "Number", expected: "_id" },
    ];

    for (const testCase of testCases) {
      const mockReq = {
        query: {
          sortBy: testCase.input,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await mapSongSortBy(mockReq, mockRes, mockNext);

      expect(mockReq.query.sortBy).toBe(testCase.expected);
    }
  });

  it("should call next() after mapping", async () => {
    const mockReq = {
      query: {
        sortBy: "A-Z",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should not call next() until after mapping is complete", async () => {
    const mockReq = {
      query: {
        sortBy: "A-Z",
      },
    };
    const mockRes = {};
    const mockNext = jest.fn();

    await mapSongSortBy(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockReq.query.sortBy).toBe("title");
  });
});
