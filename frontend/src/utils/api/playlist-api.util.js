import backendURL from "../../config/backend-url.config";

export const getAllPlaylists = async (
	searchQuery = null,
	page = 1,
	token = localStorage.getItem("_s")
) => {
	const response = await fetch(
		`${backendURL}/api/playlist?page=${page}${
			searchQuery?.q ? "&q=" + searchQuery.q : ""
		}`,
		{
			headers: token
				? {
						Authorization: `Bearer ${token}`,
				  }
				: undefined,
		}
	);
	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };
	return data;
};

export const addOrEditPlaylist = async (
	formData,
	edit = false,
	playlistId = null,
	token = localStorage.getItem("_s")
) => {
	const error = { status: 400 };
	let errorOccured = false;

	if (!formData.get("name") || formData.get("name").trim().length === 0) {
		errorOccured = true;
		error.nameMessage = "Name is required.";
	}

	if (errorOccured) throw error;

	const response = await fetch(
		`${backendURL}/api/playlist${edit ? "/" + playlistId : ""}`,
		{
			method: edit ? "PUT" : "POST",
			body: JSON.stringify({
				name: formData.get("name"),
				visibility: formData.get("visibility"),
				songs: formData.getAll("songs"),
			}),
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		}
	);
	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };

	return data;
};

export const editPlaylistVisibility = async (
	visibility,
	playlistId,
	token = localStorage.getItem("_s")
) => {
	if (!visibility) throw { message: "Visibility is required.", status: 400 };

	const response = await fetch(`${backendURL}/api/playlist/${playlistId}`, {
		method: "PATCH",
		body: JSON.stringify({ visibility }),
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };
	if (!data.updated) throw { message: "An unexpected error occurred." };
};

export const getPlaylist = async (id, token = localStorage.getItem("_s")) => {
	if (id.length === 0)
		throw new { message: "Playlist id is required.", status: 4000 }();
	const response = await fetch(`${backendURL}/api/playlist/${id}`, {
		headers: token
			? {
					Authorization: `Bearer ${token}`,
			  }
			: undefined,
	});

	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };

	return data;
};
