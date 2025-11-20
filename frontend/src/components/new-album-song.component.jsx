import { TextInput, Label, FileInput, Button } from "flowbite-react";
import { useEffect, useMemo, useRef, useState } from "react";
import CustomTailSpin from "./custom-tail-spin.component";
import { addOrEditSong, patchSong } from "../utils/api/songs-api.util";

/**
 * Component for adding or editing a song in an album
 * Handles song metadata, audio file upload, and YouTube video link
 * @param {Object} props - Component props
 * @param {Object} props.song - Song object containing existing song data (optional)
 * @param {Function} props.onSave - Callback function when song is saved
 * @param {Function} props.onSearch - Callback function to search for a song
 * @param {Function} props.onRemove - Callback function to remove song from album
 * @param {Function} props.onClear - Callback function to clear form
 * @returns {JSX.Element} New album song form component
 */
const NewAlbumSong = ({
	song,
	onSave,
	onSearch,
	onRemove,
	onClear,
	onInputChange,
	isPlaylist = false,
}) => {
	const [songNumber, setSongNumber] = useState(song?._id ? song?._id : "");
	const [videoLink, setVideoLink] = useState(
		song?.youtubeLink ? song?.youtubeLink : ""
	);
	const title = useMemo(() => (song?.title ? song?.title : ""), [song]);
	const [error, setError] = useState({});
	const [isLoadingSong, setIsLoadingSong] = useState(false);
	const [audioFile, setAudioFile] = useState(null);

	useEffect(() => {
		if (!song) {
			setSongNumber("");
			setVideoLink("");
			return;
		}
		setSongNumber(song._id);
		setVideoLink(song.youtubeLink ? song.youtubeLink : "");
	}, [song]);

	/**
	 * Handles form submission for searching or saving song
	 * @param {Event} e - Form submission event
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError({});
		setIsLoadingSong(true);
		if (!song) {
			setError((prev) => ({
				...prev,
				songNumberMessage: null,
			}));

			try {
				await onSearch(songNumber);
			} catch (error) {
				setError((prev) => ({
					...prev,
					songNumberMessage: error.message,
				}));
			} finally {
				setIsLoadingSong(false);
			}
			return;
		}
		let errorOccurred = false;
		if (!isPlaylist && !song.hasAudio && !audioFile) {
			setError((prev) => ({
				...prev,
				audioFileMessage:
					"The song has no audio file but an audio file is required",
			}));
			errorOccurred = true;
		}
		if (errorOccurred || error?.audioFileMessage)
			return setIsLoadingSong(false);
		if (!audioFile && (!videoLink || videoLink === song.youtubeLink)) {
			setIsLoadingSong(false);
			return onSave(song);
		}
		try {
			if (
				!isPlaylist &&
				(videoLink.trim() !== song.youtubeLink || audioFile)
			) {
				const formData = new FormData();
				formData.set("video-link", videoLink.trim());
				if (audioFile) formData.set("audio-file", audioFile);
				const data = await patchSong(formData, song._id);
				if (!data || !data.updated)
					throw { status: 500, message: "An unexpected error occurred." };
			}
			onSave(song);
		} catch (error) {
			if (error.status === 400) return setError({ ...error, status: null });
			setError({ message: error.message });
		} finally {
			setIsLoadingSong(false);
		}
	};

	/**
	 * Handles audio file selection and validation
	 * Validates file size (max 50MB) and type (MP3 or AAC)
	 * @param {Event} e - File input change event
	 */
	const handleAudioFileChange = (e) => {
		onInputChange();
		if (
			e.target.files &&
			e.target.files[0] &&
			e.target.files[0].size > 50 * 1024 * 1024
		)
			return setError((prev) => ({
				...prev,
				audioFileMessage: "File is too large. Maximum size is 50 MBs.",
			}));

		if (
			e.target.files &&
			e.target.files[0] &&
			e.target.files[0].type !== "audio/mpeg" &&
			e.target.files[0].type !== "audio/aac"
		)
			return setError((prev) => ({
				...prev,
				audioFileMessage: "Unsupported file type",
			}));
		setError((prev) => ({ ...prev, audioFileMessage: null }));
		setAudioFile(e.target.files[0]);
	};
	return (
		<div className="flex-1 self-stretch flex flex-col gap-10 items-stretch">
			<div className="grid grid-cols-2 gap-x-7 gap-y-2.5">
				<div className="flex flex-col gap-2.5">
					<Label htmlFor="song-number" value="Song Number" />
					<TextInput
						id="song-number"
						type="text"
						disabled={song ? true : false}
						color={error?.songNumberMessage ? "failure" : undefined}
						helperText={
							<span className="text-sm">
								{error?.songNumberMessage
									? error?.songNumberMessage
									: "The number assigned to the song."}
							</span>
						}
						value={songNumber}
						onChange={(e) => setSongNumber(e.target.value)}
					/>
				</div>
				{song && (
					<>
						<div className="flex flex-col gap-2.5">
							<Label htmlFor="title" value="Title" />
							<TextInput id="title" type="text" value={title} disabled />
						</div>
						{!isPlaylist && (
							<>
								<div className="flex flex-col gap-2.5">
									<Label htmlFor="audio-file" value="Upload Audio" />
									<FileInput
										id="audio-file"
										name="audio-file"
										helperText={
											<span className="text-sm">
												{error?.audioFileMessage
													? error?.audioFileMessage
													: song?.hasAudio
													? "Song already has an audio file. Any uploads will overwrite the current audio file."
													: "MP3 or AAC (MAX. 50 MBs)"}
											</span>
										}
										color={
											error?.audioFileMessage ? "failure" : undefined
										}
										onChange={handleAudioFileChange}
									/>
								</div>
								<div className="flex flex-col gap-2.5">
									<Label
										htmlFor="video"
										value="Youtube Video Link(Optional)"
									/>
									<TextInput
										id="video"
										type="url"
										helperText={
											<span className="text-sm">
												{error?.videoLinkMessage
													? error?.videoLinkMessage
													: "The video link of the song if it has any."}
											</span>
										}
										color={
											error?.videoLinkMessage ? "failure" : undefined
										}
										value={videoLink}
										onChange={(e) => {
											setVideoLink(e.target.value);
											onInputChange();
										}}
									/>
								</div>
							</>
						)}
					</>
				)}
			</div>
			{error?.message && (
				<p className="text-sm text-secondary text-center">
					{error?.message}
				</p>
			)}
			<div className="flex justify-end gap-2 h-max">
				<Button
					onClick={(e) => {
						setError({});
						onRemove(e);
					}}
					className="text-nowrap focus:ring-0 h-full border border-secondary text-secondary"
				>
					Remove
				</Button>
				<Button
					onClick={(e) => {
						setError({});
						onClear(e);
					}}
					className="text-nowrap focus:ring-0 h-full border border-secondary text-secondary"
				>
					Clear
				</Button>
				<Button
					onClick={handleSubmit}
					color="failure"
					className="text-nowrap focus:ring-0"
					isProcessing={isLoadingSong}
					processingSpinner={<CustomTailSpin small white />}
				>
					{song ? "Save" : "Search"}
				</Button>
			</div>
		</div>
	);
};

export default NewAlbumSong;
