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
