import {
	checkSongNumberExists,
	checkAlbumExists,
} from "../../middlewares/pre-add-song.middleware.js";
import { ClientFaultError } from "../../utils/error.util.js";
import SongModel from "../../models/song.model.js";
import AlbumModel from "../../models/album.model.js";

jest.mock("../../models/song.model.js");
jest.mock("../../models/album.model.js");

describe("pre-add-song middleware", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("checkSongNumberExists", () => {
		it("should call next() when song doesn't exist", async () => {
			const mockReq = {
				body: {
					id: "song-001",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.findById.mockResolvedValue(null);

			await checkSongNumberExists(mockReq, mockRes, mockNext);

			expect(SongModel.findById).toHaveBeenCalledWith("song-001");
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should throw error when song already exists", async () => {
			const mockReq = {
				body: {
					id: "song-001",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.findById.mockResolvedValue({
				_id: "song-001",
				title: "Existing Song",
			});

			await expect(checkSongNumberExists(mockReq, mockRes, mockNext)).rejects.toThrow(
				ClientFaultError
			);
			await expect(checkSongNumberExists(mockReq, mockRes, mockNext)).rejects.toThrow(
				"A song exists with the provided song number"
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should handle song with null _id", async () => {
			const mockReq = {
				body: {
					id: "song-002",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.findById.mockResolvedValue(null);

			await checkSongNumberExists(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should query SongModel with correct id parameter", async () => {
			const mockReq = {
				body: {
					id: "test-song-123",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.findById.mockResolvedValue(null);

			await checkSongNumberExists(mockReq, mockRes, mockNext);

			expect(SongModel.findById).toHaveBeenCalledWith("test-song-123");
		});

		it("should only query once per request", async () => {
			const mockReq = {
				body: {
					id: "song-001",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.findById.mockResolvedValue(null);

			await checkSongNumberExists(mockReq, mockRes, mockNext);

			expect(SongModel.findById).toHaveBeenCalledTimes(1);
		});
	});

	describe("checkAlbumExists", () => {
		it("should call next() when no albums provided", async () => {
			const mockReq = {
				body: {},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(AlbumModel.find).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should call next() when all albums exist", async () => {
			const mockReq = {
				body: {
					albums: "album-001,album-002",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.find.mockResolvedValue([
				{ _id: "album-001", title: "Album 1" },
				{ _id: "album-002", title: "Album 2" },
			]);

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(AlbumModel.find).toHaveBeenCalledWith({
				_id: { $in: ["album-001", "album-002"] },
			});
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockReq.body.albums).toEqual([
				{ _id: "album-001", title: "Album 1" },
				{ _id: "album-002", title: "Album 2" },
			]);
		});

		it("should throw error when albums don't exist", async () => {
			const mockReq = {
				body: {
					albums: "album-001,nonexistent",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.find.mockResolvedValue([
				{ _id: "album-001", title: "Album 1" },
			]);

			await expect(checkAlbumExists(mockReq, mockRes, mockNext)).rejects.toThrow(
				ClientFaultError
			);
			await expect(checkAlbumExists(mockReq, mockRes, mockNext)).rejects.toThrow(
				"The following albums don't exist: nonexistent"
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should throw error when all albums don't exist", async () => {
			const mockReq = {
				body: {
					albums: "nonexistent1,nonexistent2",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.find.mockResolvedValue([]);

			await expect(checkAlbumExists(mockReq, mockRes, mockNext)).rejects.toThrow(
				ClientFaultError
			);
			await expect(checkAlbumExists(mockReq, mockRes, mockNext)).rejects.toThrow(
				"The following albums don't exist: nonexistent1, nonexistent2"
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should set req.body.albums with album objects", async () => {
			const mockAlbums = [
				{ _id: "album-001", title: "Album 1" },
				{ _id: "album-002", title: "Album 2" },
			];
			const mockReq = {
				body: {
					albums: "album-001,album-002",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.find.mockResolvedValue(mockAlbums);

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(mockReq.body.albums).toEqual(mockAlbums);
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should preserve order of albums", async () => {
			const mockAlbums = [
				{ _id: "album-002", title: "Album 2" },
				{ _id: "album-001", title: "Album 1" },
			];
			const mockReq = {
				body: {
					albums: "album-001,album-002",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.find.mockResolvedValue(mockAlbums);

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(mockReq.body.albums[0]._id).toBe("album-001");
			expect(mockReq.body.albums[1]._id).toBe("album-002");
		});

		it("should call next() when albums array is empty", async () => {
			const mockReq = {
				body: {
					albums: "",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(AlbumModel.find).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should handle case where only some albums exist", async () => {
			const mockReq = {
				body: {
					albums: "album-001,album-002,nonexistent",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.find.mockResolvedValue([
				{ _id: "album-001", title: "Album 1" },
				{ _id: "album-002", title: "Album 2" },
			]);

			await expect(checkAlbumExists(mockReq, mockRes, mockNext)).rejects.toThrow(
				ClientFaultError
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

	it("should handle comma-separated albums with spaces", async () => {
			const mockReq = {
				body: {
					albums: "album-001 , album-002",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.find.mockResolvedValue([
				{ _id: "album-001 " },
				{ _id: " album-002" },
			]);

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(AlbumModel.find).toHaveBeenCalledWith({
				_id: { $in: ["album-001 ", " album-002"] },
			});
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockReq.body.albums).toHaveLength(2);
		});

		it("should query AlbumModel with correct $in operator", async () => {
			const mockReq = {
				body: {
					albums: "album-001,album-002,album-003",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.find.mockResolvedValue([
				{ _id: "album-001" },
				{ _id: "album-002" },
				{ _id: "album-003" },
			]);

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(AlbumModel.find).toHaveBeenCalledWith({
				_id: { $in: ["album-001", "album-002", "album-003"] },
			});
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockReq.body.albums).toHaveLength(3);
		});

		it("should only query once per request", async () => {
			const mockReq = {
				body: {
					albums: "album-001,album-002",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.find.mockResolvedValue([
				{ _id: "album-001" },
				{ _id: "album-002" },
			]);

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(AlbumModel.find).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockReq.body.albums).toHaveLength(2);
		});

		it("should not modify request body when albums array is empty", async () => {
			const mockReq = {
				body: {
					albums: "",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			const originalBody = { ...mockReq.body };

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(mockReq.body).toEqual(originalBody);
		});
	});
});
