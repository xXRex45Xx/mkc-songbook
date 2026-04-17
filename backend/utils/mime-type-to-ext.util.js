/**
 * MIME Type to File Extension Mapping Module.
 * Provides mappings from MIME types to their corresponding file extensions.
 * Used for file upload validation and processing.
 * @module utils/mime-type-to-ext
 */

/**
 * Maps image MIME types to their corresponding file extensions.
 * Used to convert uploaded file MIME types to file extensions for storage and processing.
 * @constant {Object.<string, string>}
 * @example
 * // Returns 'jpg' for image/jpeg
 * IMAGE_MIMETYPE_MAP['image/jpeg']
 */
export const IMAGE_MIMETYPE_MAP = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

/**
 * Maps audio MIME types to their corresponding file extensions.
 * Used to convert uploaded audio file MIME types to file extensions for storage and processing.
 * @constant {Object.<string, string>}
 * @example
 * // Returns 'mp3' for audio/mpeg
 * AUDIO_MIMETYPE_MAP['audio/mpeg']
 */
export const AUDIO_MIMETYPE_MAP = {
    "audio/mpeg": "mp3",
    "audio/aac": "aac",
};
