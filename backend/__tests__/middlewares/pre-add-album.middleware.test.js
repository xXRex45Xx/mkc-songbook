import {
	checkSongExists,
	checkAlbumExists,
	checkAlbumExistsForUpdate,
} from "../../middlewares/pre-add-album.middleware.js";
import { ClientFaultError, NotFoundError } from "../../utils/error.util.js";
import SongModel from "../../models/song.model.js";
import AlbumModel from "../../models/album.model.js";

jest.mock("../../models/song.model.js");
jest.mock("../../models/album.model.js");

describe("pre-add-album middleware", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("checkSongExists", () => {
		it("should call next() when all songs exist", async () => {
			const mockReq = {
				body: {
					songs: ["song-001", "song-002"],
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.find.mockResolvedValue([
				{ _id: "song-001" },
				{ _id: "song-002" },
			]);

			await checkSongExists(mockReq, mockRes, mockNext);

			expect(SongModel.find).toHaveBeenCalledWith({
				_id: { $in: ["song-001", "song-002"] },
			});
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should throw error when songs don't exist", async () => {
			const mockReq = {
				body: {
					songs: ["song-001", "nonexistent"],
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.find.mockResolvedValue([{ _id: "song-001" }]);

			await expect(
				checkSongExists(mockReq, mockRes, mockNext),
			).rejects.toThrow(ClientFaultError);
			await expect(
				checkSongExists(mockReq, mockRes, mockNext),
			).rejects.toThrow("The following songs don't exist: nonexistent");
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should throw error when all songs don't exist", async () => {
			const mockReq = {
				body: {
					songs: ["nonexistent1", "nonexistent2"],
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.find.mockResolvedValue([]);

			await expect(
				checkSongExists(mockReq, mockRes, mockNext),
			).rejects.toThrow(ClientFaultError);
			await expect(
				checkSongExists(mockReq, mockRes, mockNext),
			).rejects.toThrow(
				"The following songs don't exist: nonexistent1, nonexistent2",
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should set req.body.songs with song objects", async () => {
			const mockSongs = [
				{ _id: "song-001", title: "Song 1" },
				{ _id: "song-002", title: "Song 2" },
			];
			const mockReq = {
				body: {
					songs: ["song-001", "song-002"],
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.find.mockResolvedValue(mockSongs);

			await checkSongExists(mockReq, mockRes, mockNext);

			expect(mockReq.body.songs).toEqual(mockSongs);
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should preserve order of songs", async () => {
			const mockSongs = [
				{ _id: "song-002", title: "Song 2" },
				{ _id: "song-001", title: "Song 1" },
			];
			const mockReq = {
				body: {
					songs: ["song-001", "song-002"],
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.find.mockResolvedValue(mockSongs);

			await checkSongExists(mockReq, mockRes, mockNext);

			expect(mockReq.body.songs[0]._id).toBe("song-001");
			expect(mockReq.body.songs[1]._id).toBe("song-002");
		});

		it("should throw error when songs array is empty", async () => {
			const mockReq = {
				body: {
					songs: [],
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.find.mockResolvedValue([]);

			await checkSongExists(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should handle case where only some songs exist", async () => {
			const mockReq = {
				body: {
					songs: ["song-001", "song-002", "nonexistent"],
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			SongModel.find.mockResolvedValue([
				{ _id: "song-001" },
				{ _id: "song-002" },
			]);

			await expect(
				checkSongExists(mockReq, mockRes, mockNext),
			).rejects.toThrow(ClientFaultError);
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe("checkAlbumExists", () => {
		it("should call next() when album doesn't exist", async () => {
			const mockReq = {
				body: {
					id: "album-001",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.findById.mockResolvedValue(null);

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(AlbumModel.findById).toHaveBeenCalledWith("album-001");
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should throw error when album already exists", async () => {
			const mockReq = {
				body: {
					id: "album-001",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.findById.mockResolvedValue({
				_id: "album-001",
				name: "Existing Album",
			});

			await expect(
				checkAlbumExists(mockReq, mockRes, mockNext),
			).rejects.toThrow(ClientFaultError);
			await expect(
				checkAlbumExists(mockReq, mockRes, mockNext),
			).rejects.toThrow("Album with id album-001 already exists.");
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should handle album with null _id", async () => {
			const mockReq = {
				body: {
					id: "album-002",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.findById.mockResolvedValue(null);

			await checkAlbumExists(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
		});
	});

	describe("checkAlbumExistsForUpdate", () => {
		it("should call next() when album exists and ID is not changing", async () => {
			const mockReq = {
				params: {
					id: "album-001",
				},
				body: {
					id: "album-001",
					name: "Updated Name",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.findById.mockResolvedValue({
				_id: "album-001",
				name: "Original Name",
			});

			await checkAlbumExistsForUpdate(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should throw NotFoundError when album doesn't exist", async () => {
			const mockReq = {
				params: {
					id: "nonexistent",
				},
				body: {
					name: "Updated Name",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.findById.mockResolvedValue(null);

			await expect(
				checkAlbumExistsForUpdate(mockReq, mockRes, mockNext),
			).rejects.toThrow(NotFoundError);
			await expect(
				checkAlbumExistsForUpdate(mockReq, mockRes, mockNext),
			).rejects.toThrow("Album with id nonexistent does not exist.");
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should throw error when changing ID to existing album", async () => {
			const mockReq = {
				params: {
					id: "album-001",
				},
				body: {
					id: "album-002",
					name: "Updated Name",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.findById
				.mockResolvedValueOnce({ _id: "album-001" })
				.mockResolvedValue({ _id: "album-002" });

			await expect(
				checkAlbumExistsForUpdate(mockReq, mockRes, mockNext),
			).rejects.toThrow(ClientFaultError);
			await expect(
				checkAlbumExistsForUpdate(mockReq, mockRes, mockNext),
			).rejects.toThrow("Album with id album-002 already exists.");
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should call AlbumModel.findById twice when changing ID", async () => {
			const mockReq = {
				params: {
					id: "album-001",
				},
				body: {
					id: "album-002",
					name: "Updated Name",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.findById
				.mockResolvedValueOnce({ _id: "album-001" })
				.mockResolvedValueOnce(null);

			await checkAlbumExistsForUpdate(mockReq, mockRes, mockNext);

			expect(AlbumModel.findById).toHaveBeenCalledTimes(2);
			expect(AlbumModel.findById).toHaveBeenCalledWith("album-001");
			expect(AlbumModel.findById).toHaveBeenCalledWith("album-002");
		});

		it("should only call AlbumModel.findById once when ID is not changing", async () => {
			const mockReq = {
				params: {
					id: "album-001",
				},
				body: {
					id: "album-001",
					name: "Updated Name",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.findById.mockResolvedValue({ _id: "album-001" });

			await checkAlbumExistsForUpdate(mockReq, mockRes, mockNext);

			expect(AlbumModel.findById).toHaveBeenCalledTimes(1);
		});

		it("should throw error when new ID conflicts with different album", async () => {
			const mockReq = {
				params: {
					id: "album-A",
				},
				body: {
					id: "album-B",
					name: "Updated Name",
				},
			};
			const mockRes = {};
			const mockNext = jest.fn();

			AlbumModel.findById
				.mockResolvedValueOnce({ _id: "album-A" })
				.mockResolvedValueOnce({ _id: "album-B", name: "Existing" });

			await expect(
				checkAlbumExistsForUpdate(mockReq, mockRes, mockNext),
			).rejects.toThrow(ClientFaultError);
		});
	});
});
