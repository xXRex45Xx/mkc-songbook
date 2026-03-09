import PlaylistModel from "../models/playlist.model.js";
import SongModel from "../models/song.model.js";
import {
  getAllPlaylistsQuerySchema,
  createPlaylistBodySchema,
  updatePlaylistBodySchema,
  getPlaylistParamsSchema,
  patchPlaylistBodySchema,
} from "../models/validation-schemas/playlist.validation-schema.js";
import { ClientFaultError, NotFoundError } from "../utils/error.util.js";
import validateSchema from "../utils/validator.util.js";

/**
 * Validates the request body for creating a new playlist.
 *
 * This middleware validates the request body for playlist creation requests against
 * the defined validation schema. It ensures that songs field is always an array,
 * even when a single song is provided, before proceeding with playlist creation.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates playlist creation body with proper schema checking and array normalization explaining the complete validation process flow
 */
export const validateCreatePlaylist = async (req, res, next) => {
  if (typeof req.body.songs === "string") req.body.songs = [req.body.songs];
  await validateSchema(req.body, createPlaylistBodySchema);
  next();
};

/**
 * Validates the request body for updating an existing playlist.
 *
 * This middleware validates the request body for playlist update requests against
 * the defined validation schema. It ensures that all required fields are present and meet criteria.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates playlist update body with proper schema checking explaining the complete validation process flow
 */
export const validateUpdatePlaylist = async (req, res, next) => {
  await validateSchema(req.body, updatePlaylistBodySchema);
  next();
};

/**
 * Validates patch operations for updating a playlist.
 *
 * This middleware validates patch requests for playlist updates against
 * the defined validation schema. It also checks that users can only add songs to playlists they own,
 * and validates that added songs exist in the database.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates playlist patch with proper schema and ownership checks explaining the complete validation process flow
 * @throws {NotFoundError} If playlist is not found with clear explanation of not found condition and error context
 * @throws {ForbiddenError} If user is not authorized to update the playlist with clear explanation of authorization failure and error context
 * @throws {ClientFaultError} If songs are already in the playlist or don't exist in database with clear explanation of validation errors and error context
 */
export const validatePatchPlaylist = async (req, _res, next) => {
  await validateSchema(req.body, patchPlaylistBodySchema);

  const { id } = req.params;
  const { addSongs } = req.body;

  const playlist = await PlaylistModel.findById(id);
  if (!playlist) throw new NotFoundError("Playlist not found.");
  if (playlist.creator.toString() !== req.user._id.toString())
    throw new ForbiddenError("You are not authorized to update this playlist");
  req.playlist = playlist;

  if (!addSongs || addSongs.length === 0) return next();

  if (addSongs && addSongs.length > 0) {
    addSongs.forEach((song) => {
      if (playlist.songs.includes(song))
        throw new ClientFaultError(
          "One or more songs are already in the playlist.",
        );
    });
    const songsInDb = await SongModel.find({ _id: { $in: addSongs } });
    if (songsInDb.length !== addSongs.length)
      throw new ClientFaultError("One or more songs don't exist.");
  }
  next();
};

/**
 * Validates query parameters for getting all playlists.
 *
 * This middleware validates query parameters for playlist listing requests against
 * the defined validation schema. It ensures that search queries and pagination parameters
 * meet the specified criteria before proceeding with playlist retrieval.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates query parameters with proper schema checking explaining the complete validation process flow
 */
export const validateGetAllPlaylists = async (req, res, next) => {
  await validateSchema(req.query, getAllPlaylistsQuerySchema);
  next();
};

/**
 * Validates the request parameters for getting a specific playlist.
 *
 * This middleware validates the request parameters for playlist detail retrieval requests against
 * the defined validation schema. It ensures that playlist ID is properly formatted before proceeding.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates playlist parameters with proper schema checking explaining the complete validation process flow
 */
export const validateGetPlaylist = async (req, res, next) => {
  await validateSchema(req.params, getPlaylistParamsSchema);
  next();
};
