/**
 * Song sort mapping middleware module.
 * Maps user-friendly sort options to database field names for song sorting.
 */

/**
 * Maps user-friendly sort options to corresponding database field names.
 *
 * This middleware converts user-friendly sort options into database field names
 * that can be used for query sorting. It supports the following mappings:
 * - "A-Z" -> "title"
 * - "Recently Added" -> "createdAt"
 * - default -> "_id"
 *
 * @param {Object} req - Express request object containing request data with explanation of sort options and field names
 * @param {Object} req.query - Query parameters containing sortBy option with explanation of supported sort values and format requirements
 * @param {string} req.query.sortBy - Sort option provided by the user with explanation of supported sort options and their database field mappings
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Maps sort options to database fields explaining the complete mapping process flow
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

