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
    albumId = null,
    token = localStorage.getItem("_s")
) => {
    const error = { status: 400 };
    let errorOccured = false;

    if (!formData.get("id") || formData.get("id").trim().length === 0) {
        errorOccured = true;
        error.idMessage = "Album number is required.";
    }

    if (!formData.get("title") || formData.get("title").trim().length === 0) {
        errorOccured = true;
        error.titleMessage = "Title is required.";
    }

    if (
        formData.get("playlist-link") &&
        !(
            formData.get("playlist-link").includes("youtu.be") ||
            formData.get("playlist-link").includes("youtube.com")
        )
    ) {
        errorOccured = true;
        error.playlistLinkMessage = "Please enter a valid youtube link.";
    }
    if (formData.getAll("songs").length === 0) {
        errorOccured = true;
        error.trackMessage =
            "An empty album is not allowed. Please add one or more tracks.";
    }

    if (errorOccured) throw error;

    const response = await fetch(
        `${backendURL}/api/album${edit ? "/" + albumId : ""}`,
        {
            method: edit ? "PUT" : "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};
