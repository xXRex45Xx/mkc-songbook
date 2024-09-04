import backendURL from "../../config/backend-url.config";

export const getAllOrSearchSongs = async (searchQuery = null, page = 1) => {
    const response = await fetch(
        `${backendURL}/api/song?page=${page}${
            searchQuery.q ? "&q=" + searchQuery.q : ""
        }`
    );
    const data = await response.json();
    if (!response.ok) {
        throw { message: data.message, status: response.status };
    }

    return data;
};
