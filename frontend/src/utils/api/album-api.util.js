import backendURL from "../../config/backend-url.config";

export const getAllAlbums = async (namesOnly = false) => {
    const response = await fetch(
        `${backendURL}/api/album${namesOnly ? "?names=true" : ""}`
    );
    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};
