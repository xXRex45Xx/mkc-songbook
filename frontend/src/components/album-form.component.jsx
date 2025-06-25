import { Accordion, Button, FileInput, Label, TextInput } from "flowbite-react";
import {
	Form,
	useActionData,
	useNavigate,
	useSubmit,
	useNavigation,
} from "react-router-dom";

import addIcon from "../assets/add-small.svg";
import greenTickIcon from "../assets/green.svg";
import { useRef, useState } from "react";
import NewAlbumSong from "./new-album-song.component";
import { getSong } from "../utils/api/songs-api.util";
import { useEffect } from "react";
import CustomTailSpin from "./custom-tail-spin.component";
/**
 * Album Form Component
 *
 * A form component for creating and editing albums.
 * Includes fields for album details, cover image, YouTube playlist,
 * and a dynamic list of songs with search and validation functionality.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.method - HTTP method for form submission (POST/PUT)
 * @param {string} props.action - Form submission endpoint
 * @param {Object} props.album - Existing album data for editing (optional)
 */
const AlbumForm = ({ method, action, album }) => {
	const navigate = useNavigate();
	const navigation = useNavigation();
	const submit = useSubmit();
	const titleRef = useRef();
	const playlistRef = useRef();
	const idRef = useRef();
	/**
	 * State for managing the list of songs in the album
	 * Each song has a 'final' flag indicating if it's been confirmed
	 */
	const [songList, setSongList] = useState([]);
	useEffect(() => {
		if (!album?.songs) return;
		setSongList(album?.songs.map((song) => ({ final: true, song })));
	}, [album]);
	/**
	 * States for error handling and file upload
	 */
	const [trackError, setTrackError] = useState(null);
	const [albumCoverMessage, setAlbumCoverMessage] = useState(null);
	const [alubmCover, setAlbumCover] = useState(null);
	const error = useActionData();

	/**
	 * Adds a new empty song slot to the album
	 * @param {React.MouseEvent} e - Click event
	 */
	const handleAddSong = (e) => {
		e.preventDefault();
		setSongList((prev) => [...prev, { final: false, song: null }]);
	};

	/**
	 * Removes a song from the album at the specified index
	 * @param {number} idx - Index of the song to remove
	 */
	const handleRemoveSong = (idx) => {
		setSongList((prev) => {
			const temp = [];
			for (let i = 0; i < prev.length; i++) {
				if (i == idx) continue;
				temp.push({ ...prev[i] });
			}
			return temp;
		});
	};

	/**
	 * Clears a song's data at the specified index
	 * @param {number} idx - Index of the song to clear
	 */
	const handleClearSong = (idx) => {
		setSongList((prev) => {
			prev[idx] = { final: false, song: null };
			return [...prev];
		});
	};

	/**
	 * Marks a song as finalized at the specified index
	 * @param {number} idx - Index of the song to finalize
	 */
	const handleChooseSong = (idx) => {
		setSongList((prev) => {
			prev[idx].final = true;
			return [...prev];
		});
	};

	/**
	 * Searches for a song by ID and adds it to the album
	 * Validates that the song isn't already in the album
	 *
	 * @param {string} id - Song ID to search for
	 * @param {number} idx - Index where to add the found song
	 * @throws {Error} If song is already in the album
	 */
	const handleSongSearch = async (id, idx) => {
		const songsWithId = songList.filter(({ song }) => song?._id == id.trim());

		if (songsWithId.length > 0) {
			throw {
				message: `Song is already in the album at track #${
					songList.indexOf(songsWithId[0]) + 1
				}`,
			};
		}

		const fetchedSong = await getSong(id);
		setSongList((prev) => {
			prev[idx] = { final: false, song: fetchedSong };
			return [...prev];
		});
	};

	/**
	 * Handles album cover image upload and validation
	 * Validates file size (max 30MB) and type (JPG, JPEG, PNG)
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
	 */
	const handleAlbumCoverChange = (e) => {
		if (
			e.target.files &&
			e.target.files[0] &&
			e.target.files[0].size > 30 * 1024 * 1024
		)
			return setAlbumCoverMessage("File is too large. Maximum size is 30 MBs.");
		if (
			e.target.files &&
			e.target.files[0] &&
			!["image/jpeg", "image/jpg", "image/png"].includes(e.target.files[0].type)
		)
			return setAlbumCoverMessage("Unsupported file type.");
		setAlbumCoverMessage(null);
		setAlbumCover(e.target.files[0]);
	};

	/**
	 * Handles form submission
	 * Validates that all songs are finalized
	 * Creates FormData with album details and songs
	 *
	 * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
	 */
	const handleSubmit = (e) => {
		e.preventDefault();
		setTrackError(null);

		if (songList.length === 0) return setTrackError("Please add a song.");
		const nonFinalizedSongs = songList
			.map(({ final }, idx) => ({ idx, final }))
			.filter(({ final }) => !final);

		if (nonFinalizedSongs.length > 0) {
			let errorMessage = "Please finalize or remove track ";
			nonFinalizedSongs.forEach((_song, index) => {
				if (index === nonFinalizedSongs.length - 1)
					errorMessage += `#${index + 1}`;
				else errorMessage += `#${index + 1}, `;
			});
			return setTrackError(errorMessage);
		}

		const formData = new FormData();
		formData.append("id", idRef.current.value);
		formData.append("title", titleRef.current.value);
		if (playlistRef.current.value)
			formData.append("youtube_playlist_link", playlistRef.current.value);
		songList.forEach(({ song }) => formData.append("songs", song._id));
		if (alubmCover) formData.append("cover", alubmCover);

		submit(formData, { action, method, encType: "multipart/form-data" });
	};

	const handleSongInputChange = (idx) => {
		setSongList((prev) => {
			prev[idx] = {
				...prev[idx],
				final: false,
			};
			return [...prev];
		});
	};
	return (
		<Form
			className="flex-1 self-stretch flex flex-col py-3.5 px-5 gap-10 items-stretch"
			encType="multipart/form-data"
			onSubmit={handleSubmit}
		>
			<div className="flex gap-7">
				<div className="flex-1 flex flex-col gap-2.5">
					<Label htmlFor="id" value="Album Number" />
					<TextInput
						id="id"
						name="id"
						type="text"
						ref={idRef}
						defaultValue={album?._id}
						color={error?.idMessage ? "failure" : undefined}
						helperText={
							<span className="text-sm">
								{error?.idMessage
									? error?.idMessage
									: "The number assigned to the album."}
							</span>
						}
					/>
				</div>
				<div className="flex-1 flex flex-col gap-2.5">
					<Label htmlFor="title" value="Album Title" />
					<TextInput
						id="title"
						name="title"
						type="text"
						ref={titleRef}
						defaultValue={album?.name}
						color={error?.titleMessage ? "failure" : undefined}
						helperText={<span className="text-sm">{error?.titleMessage}</span>}
					/>
				</div>
			</div>
			<div className="flex gap-7">
				<div className="flex-1 flex flex-col gap-2.5">
					<Label htmlFor="cover" value="Album Photo (Optional)" />
					<FileInput
						id="cover"
						helperText={
							<span className="text-sm">
								{albumCoverMessage
									? albumCoverMessage
									: "JPG, JPEG, or PNG (MAX. 30MBs)"}
							</span>
						}
						color={albumCoverMessage ? "failure" : undefined}
						onChange={handleAlbumCoverChange}
					/>
				</div>
				<div className="flex-1 flex flex-col gap-2.5">
					<Label
						htmlFor="youtube-playlist"
						value="Youtube Playlist Link (Optional)"
					/>
					<TextInput
						id="youtube-playlist"
						name="youtube_playlist_link"
						type="text"
						ref={playlistRef}
						color={error?.playlistLinkMessage ? "failure" : undefined}
						helperText={
							<span className="text-sm">
								{error?.playlistLinkMessage
									? error?.playlistLinkMessage
									: "If the album has a youtube playlist."}
							</span>
						}
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto flex flex-col items-stretch gap-3.5">
				<Accordion collapseAll className={trackError ? "border-secondary" : ""}>
					{songList.map(({ final, song }, idx) => (
						<Accordion.Panel key={idx}>
							<Accordion.Title
								className={`text-2xl font-semibold focus:ring-0 ${
									final ? "text-success-200 rounded-lg" : "text-neutrals-800"
								}`}
							>
								<div className="flex items-center gap-2.5">
									{final && <img src={greenTickIcon} />}
									Track #{idx + 1}
								</div>
							</Accordion.Title>
							<Accordion.Content>
								<NewAlbumSong
									song={song}
									idx={idx}
									onRemove={handleRemoveSong.bind(null, idx)}
									onSave={handleChooseSong.bind(null, idx)}
									onSearch={(id) => handleSongSearch(id, idx)}
									onClear={handleClearSong.bind(null, idx)}
									onInputChange={handleSongInputChange.bind(null, idx)}
								/>
							</Accordion.Content>
						</Accordion.Panel>
					))}
				</Accordion>
				{(trackError || error?.message) && (
					<p className="text-sm text-secondary text-center">
						{trackError ? trackError : error?.message}
					</p>
				)}
				<div className="mt-auto flex justify-end">
					<Button
						onClick={handleAddSong}
						className="text-baseblack bg-neutrals-100 focus:ring-0"
					>
						<div className="flex gap-2 text-xs">
							Add Song <img src={addIcon} />
						</div>
					</Button>
				</div>
				<div className="flex justify-end gap-7">
					<Button
						onClick={() => navigate(-1)}
						className="text-lg px-7 text-nowrap focus:ring-0 h-full border border-secondary text-secondary"
					>
						Cancel
					</Button>
					<Button
						color="failure"
						className="text-nowrap focus:ring-0 h-full text-lg px-7"
						type="submit"
						isProcessing={navigation.state === "submitting"}
						processingSpinner={<CustomTailSpin small white />}
					>
						{location.pathname.includes("edit") ? "Update" : "Submit"}
					</Button>
				</div>
			</div>
		</Form>
	);
};

export default AlbumForm;
