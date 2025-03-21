import backendURL from "../../config/backend-url.config";

export const getAllAlbums = async (namesOnly = false) => {
    const response = await fetch(
        `${backendURL}/api/album${namesOnly ? "?names=true" : ""}`
    );
    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

export const addOrEditAlbum = async (
    formData,
    edit = false,
    albumId = null
) => {
    const error = { status: 400 };
    let errorOccured = false;

    if (!formData.get("title") || formData.get("title").trim().length === 0) {
        errorOccured = true;
        error.titleMessage = "Title is required.";
    }
    if (
        formData.get("youtube_playlist_link") &&
        !(
            formData.get("youtube_playlist_link").includes("youtu.be") ||
            formData.get("youtube_playlist_link").includes("youtube.com")
        )
    ) {
        errorOccured = true;
        error.playlistLinkMessage =
            "Please enter a valid youtube playlist link.";
    }

    if (errorOccured) throw error;
};
