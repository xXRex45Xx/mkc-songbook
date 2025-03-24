/**
 * MIME Type to File Extension Mapping Module.
 * Provides mappings from MIME types to their corresponding file extensions.
 * Used for file upload validation and processing.
 * @module utils/mime-type-to-ext
 */

/**
 * Maps image MIME types to their corresponding file extensions.
 * @constant {Object.<string, string>}
 */
export const IMAGE_MIMETYPE_MAP = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

/**
 * Maps audio MIME types to their corresponding file extensions.
 * @constant {Object.<string, string>}
 */
export const AUDIO_MIMETYPE_MAP = {
    "audio/mpeg": "mp3",
    "audio/aac": "aac",
};
