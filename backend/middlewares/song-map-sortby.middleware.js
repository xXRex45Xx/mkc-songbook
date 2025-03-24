/**
 * Song sort mapping middleware module.
 * Maps user-friendly sort options to database field names for song sorting.
 */

/**
 * Maps user-friendly sort options to corresponding database field names.
 * Supported sort options:
 * - "A-Z" -> "title"
 * - "Recently Added" -> "createdAt"
 * - default -> "_id"
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters containing sortBy option
 * @param {string} req.query.sortBy - Sort option provided by the user
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
const mapSongSortBy = async (req, _res, next) => {
    switch (req.query.sortBy) {
        case "A-Z":
            req.query.sortBy = "title";
            break;
        case "Recently Added":
            req.query.sortBy = "createdAt";
            break;
        default:
            req.query.sortBy = "_id";
            break;
    }
    next();
};

export default mapSongSortBy;
