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
