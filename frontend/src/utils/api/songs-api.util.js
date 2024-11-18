import backendURL from "../../config/backend-url.config";

export const getAllOrSearchSongs = async (searchQuery = null, page = 1) => {
    const response = await fetch(
        `${backendURL}/api/song?page=${page}${
            searchQuery.q ? "&q=" + searchQuery.q : ""
        }${searchQuery.type ? "&type=" + searchQuery.type : ""}${
            searchQuery.sortBy ? "&sortBy=" + searchQuery.sortBy : ""
        }`
    );
    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

export const getSong = async (id) => {
    const response = await fetch(`${backendURL}/api/song/${id}`);
    const data = await response.json();

    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

export const addSong = async (formData) => {
    const error = { status: 400 };
    let errorOccured = false;
    if (!formData.get("title") || formData.get("title").trim().length === 0) {
        errorOccured = true;
        error.titleMessage = "Title is required.";
    }
    if (
        !formData.get("id") ||
        isNaN(parseInt(formData.get("id"))) ||
        parseInt(formData.get("id")) < 1
    ) {
        errorOccured = true;
        error.songNumberMessage = "Please enter a valid song number.";
    }
    if (
        formData.get("video-link") &&
        !(
            formData.get("video-link").includes("youtu.be") ||
            formData.get("video-link").includes("youtube.com")
        )
    ) {
        errorOccured = true;
        error.videoLinkMessage = "Please enter a valid youtube link.";
    }
    if (
        formData.get("tempo") &&
        (isNaN(parseInt(formData.get("tempo"))) ||
            parseInt(formData.get("tempo") < 30))
    ) {
        errorOccured = true;
        error.tempoMessage = "Please enter a valid tempo.";
    }
    if (!formData.get("lyrics")) {
        errorOccured = true;
        error.lyricsMessage = "Lyrics is required.";
    }
    if (!formData.get("tempo")) formData.delete("tempo");
    if (!formData.get("video-link")) formData.delete("video-link");
    if (errorOccured) throw error;

    const response = await fetch(`${backendURL}/api/song`, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};
