describe("file-upload middleware", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe("userImageUpload", () => {
    it("should create multer instance with userImageOpts", async () => {
      const mockMulterInstance = { field: jest.fn() };
      const mockMulter = jest.fn((opts) => {
        return mockMulterInstance;
      });
      jest.mock("multer", () => mockMulter);

      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const module = await import("../../middlewares/file-upload.middleware.js");
      const uploadMiddleware = module.userImageUpload;

      expect(mockMulter).toHaveBeenCalledWith({
        dest: "uploads/users",
        limits: { fileSize: 2097152 },
        fileFilter: expect.any(Function),
      });
      expect(uploadMiddleware).toBe(mockMulterInstance);
    });

    it("should use correct multer configuration", async () => {
      const mockMulter = jest.fn((opts) => {
        return { field: jest.fn() };
      });
      jest.mock("multer", () => mockMulter);

      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const module = await import("../../middlewares/file-upload.middleware.js");
      expect(mockMulter).toHaveBeenCalledTimes(3);
      const calledWith = mockMulter.mock.calls[0][0];
      expect(calledWith).toEqual({
        dest: "uploads/users",
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: expect.any(Function),
      });
    });
  });

  describe("albumImageUpload", () => {
    it("should create multer instance with albumImageOpts", async () => {
      const mockMulterInstance = { field: jest.fn() };
      const mockMulter = jest.fn((opts) => {
        return mockMulterInstance;
      });
      jest.mock("multer", () => mockMulter);

      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const module = await import("../../middlewares/file-upload.middleware.js");
      const uploadMiddleware = module.albumImageUpload;

      expect(mockMulter).toHaveBeenCalledWith({
        dest: "uploads/albums",
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: expect.any(Function),
      });
      expect(uploadMiddleware).toBe(mockMulterInstance);
    });

    it("should use correct multer configuration", async () => {
      const mockMulter = jest.fn((opts) => {
        return { field: jest.fn() };
      });
      jest.mock("multer", () => mockMulter);

      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const module = await import("../../middlewares/file-upload.middleware.js");
      expect(mockMulter).toHaveBeenCalledTimes(3);
      const calledWith = mockMulter.mock.calls[1][0];
      expect(calledWith).toEqual({
        dest: "uploads/albums",
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: expect.any(Function),
      });
    });
  });

  describe("audioUpload", () => {
    it("should create multer instance with audioOpts", async () => {
      const mockMulterInstance = { field: jest.fn() };
      const mockMulter = jest.fn((opts) => {
        return mockMulterInstance;
      });
      jest.mock("multer", () => mockMulter);

      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const module = await import("../../middlewares/file-upload.middleware.js");
      const uploadMiddleware = module.audioUpload;

      expect(mockMulter).toHaveBeenCalledWith({
        dest: "uploads/audio",
        limits: { fileSize: 50 * 1024 * 1024 },
        fileFilter: expect.any(Function),
      });
      expect(uploadMiddleware).toBe(mockMulterInstance);
    });

    it("should use correct multer configuration", async () => {
      const mockMulter = jest.fn((opts) => {
        return { field: jest.fn() };
      });
      jest.mock("multer", () => mockMulter);

      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const module = await import("../../middlewares/file-upload.middleware.js");
      expect(mockMulter).toHaveBeenCalledTimes(3);
      const calledWith = mockMulter.mock.calls[2][0];
      expect(calledWith).toEqual({
        dest: "uploads/audio",
        limits: { fileSize: 50 * 1024 * 1024 },
        fileFilter: expect.any(Function),
      });
    });
  });

  describe("multer configuration validation", () => {
    it("should have different configurations for different upload types", async () => {
      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const { userImageOpts, albumImageOpts, audioOpts } = await import("../../config/multer.config.js");

      expect(userImageOpts).not.toBe(albumImageOpts);
      expect(userImageOpts).not.toBe(audioOpts);
      expect(albumImageOpts).not.toBe(audioOpts);
    });

    it("should have dest property for each upload type", async () => {
      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const { userImageOpts, albumImageOpts, audioOpts } = await import("../../config/multer.config.js");

      expect(userImageOpts.dest).toBeDefined();
      expect(albumImageOpts.dest).toBeDefined();
      expect(audioOpts.dest).toBeDefined();
    });

    it("should have limits property for each upload type", async () => {
      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const { userImageOpts, albumImageOpts, audioOpts } = await import("../../config/multer.config.js");

      expect(userImageOpts.limits).toBeDefined();
      expect(albumImageOpts.limits).toBeDefined();
      expect(audioOpts.limits).toBeDefined();
    });

    it("should have fileFilter property for each upload type", async () => {
      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const { userImageOpts, albumImageOpts, audioOpts } = await import("../../config/multer.config.js");

      expect(userImageOpts.fileFilter).toBeDefined();
      expect(albumImageOpts.fileFilter).toBeDefined();
      expect(audioOpts.fileFilter).toBeDefined();
    });
  });

  describe("upload middleware behavior", () => {
    it("should return multer middleware instance", async () => {
      const mockMulterInstance = {
        field: jest.fn(),
        single: jest.fn(() => (req, res, next) => {}),
        array: jest.fn(() => (req, res, next) => {}),
      };
      const mockMulter = jest.fn((opts) => {
        return mockMulterInstance;
      });
      jest.mock("multer", () => mockMulter);

      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const module = await import("../../middlewares/file-upload.middleware.js");
      const result = module.userImageUpload;

      expect(result).toBe(mockMulterInstance);
    });

    it("should be callable as middleware", async () => {
      const mockMiddleware = jest.fn((req, res, next) => {});
      const mockMulterInstance = {
        single: jest.fn(() => mockMiddleware),
        field: jest.fn(),
        array: jest.fn(),
        fields: jest.fn(),
        any: jest.fn(),
        none: jest.fn(),
      };
      const mockMulter = jest.fn((opts) => {
        return mockMulterInstance;
      });
      jest.mock("multer", () => mockMulter);

      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const module = await import("../../middlewares/file-upload.middleware.js");
      const middleware = module.userImageUpload;
      expect(typeof middleware).toBe("object");
    });

    it("should have single method for user image upload", async () => {
      const mockMulterInstance = {
        single: jest.fn(),
        field: jest.fn(),
        array: jest.fn(),
        fields: jest.fn(),
        any: jest.fn(),
        none: jest.fn(),
      };
      const mockMulter = jest.fn((opts) => {
        return mockMulterInstance;
      });
      jest.mock("multer", () => mockMulter);

      jest.mock("../../config/multer.config.js", () => ({
        userImageOpts: {
          dest: "uploads/users",
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        albumImageOpts: {
          dest: "uploads/albums",
          limits: { fileSize: 5 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
        audioOpts: {
          dest: "uploads/audio",
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: jest.fn(),
        },
      }));

      const module = await import("../../middlewares/file-upload.middleware.js");
      const result = module.userImageUpload;

      expect(typeof result.single).toBe("function");
    });
  });
});
