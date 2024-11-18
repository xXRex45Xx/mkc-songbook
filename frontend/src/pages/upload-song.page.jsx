import MainBodyContainer from "../components/main-body-container.component";
import {
    Label,
    FileInput,
    TextInput,
    Select,
    Textarea,
    Button,
} from "flowbite-react";
import {
    Await,
    defer,
    Form,
    redirect,
    useActionData,
    useLoaderData,
    useNavigate,
    useNavigation,
    useSubmit,
} from "react-router-dom";

import "./upload-song.styles.css";
import { getAllAlbums } from "../utils/api/album-api.util";
import { Suspense, useState } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { addSong } from "../utils/api/songs-api.util";

const UploadSongPage = () => {
    const navigate = useNavigate();
    const submit = useSubmit();
    const navigation = useNavigation();
    const loaderData = useLoaderData();
    const error = useActionData();
    const [fileInputErrorMessage, setFileInputErrorMessage] = useState("");
    const fileInputChangeHandler = (e) => {
        if (
            e.target.files &&
            e.target.files[0] &&
            e.target.files[0].size > 50 * 1024 * 1024
        )
            return setFileInputErrorMessage(
                "File is too large. Maximum size is 50 MBs."
            );

        if (
            e.target.files &&
            e.target.files[0] &&
            e.target.files[0].type !== "audio/mpeg" &&
            e.target.files[0].type !== "audio/aac"
        )
            return setFileInputErrorMessage("Unsupported file type");
        setFileInputErrorMessage("");
    };

    const formSubmitHandler = (e) => {
        e.preventDefault();
        if (!fileInputErrorMessage) return submit(e.target);
    };
    return (
        <MainBodyContainer title="Upload Song">
            <Suspense fallback={<CustomTailSpin />}>
                <Await resolve={loaderData.albums}>
                    {(albums) => (
                        <Form
                            className="flex-1 self-stretch flex flex-col py-3.5 px-5 gap-10 items-stretch"
                            method="POST"
                            onSubmit={formSubmitHandler}
                            encType="multipart/form-data"
                        >
                            <div className="grid grid-cols-2 gap-x-7 gap-y-2.5">
                                <div className="flex flex-col gap-2.5">
                                    <Label htmlFor="title" value="Song Title" />
                                    <TextInput
                                        id="title"
                                        name="title"
                                        type="text"
                                        color={
                                            error?.titleMessage
                                                ? "failure"
                                                : undefined
                                        }
                                        helperText={
                                            <span className="text-sm">
                                                {error?.titleMessage}
                                            </span>
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <Label
                                        htmlFor="song-number"
                                        value="Song Number"
                                    />
                                    <TextInput
                                        id="song-number"
                                        name="id"
                                        type="number"
                                        helperText={
                                            <span className="text-sm">
                                                {error?.songNumberMessage
                                                    ? error?.songNumberMessage
                                                    : "The number assigned to the song."}
                                            </span>
                                        }
                                        min="1"
                                        color={
                                            error?.songNumberMessage
                                                ? "failure"
                                                : undefined
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <Label
                                        htmlFor="chord"
                                        value="Chord (Optional)"
                                    />
                                    <TextInput
                                        id="chord"
                                        name="chord"
                                        type="text"
                                    />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <Label
                                        htmlFor="tempo"
                                        value="Tempo (Optional)"
                                    />
                                    <TextInput
                                        id="tempo"
                                        name="tempo"
                                        type="number"
                                        min="30"
                                        color={
                                            error?.tempoMessage
                                                ? error?.tempoMessage
                                                : undefined
                                        }
                                        helperText={
                                            <span className="text-sm">
                                                {error?.tempoMessage}
                                            </span>
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <Label
                                        htmlFor="rythm"
                                        value="Rythm (Optional)"
                                    />
                                    <TextInput id="rythm" name="rythm" />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <Label
                                        htmlFor="album"
                                        value="Album Title (Optional)"
                                    />
                                    <Select
                                        id="album"
                                        name="album"
                                        helperText="The album the song belongs to."
                                    >
                                        <option value=""></option>
                                        {albums.map((album) => (
                                            <option
                                                key={album._id}
                                                value={album._id}
                                            >
                                                {album.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <Label
                                        htmlFor="audio-file"
                                        value="Upload Audio (Optional)"
                                    />
                                    <FileInput
                                        id="audio-file"
                                        name="audio-file"
                                        onChange={fileInputChangeHandler}
                                        helperText={
                                            <span className="text-sm">
                                                {fileInputErrorMessage
                                                    ? fileInputErrorMessage
                                                    : "MP3 or AAC (MAX. 50 MBs)"}
                                            </span>
                                        }
                                        color={
                                            fileInputErrorMessage
                                                ? "failure"
                                                : undefined
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <Label
                                        htmlFor="video"
                                        value="Youtube Video Link (Optional)"
                                    />
                                    <TextInput
                                        id="video-link"
                                        name="video-link"
                                        type="url"
                                        helperText={
                                            <span className="text-sm">
                                                The video link of the song if it
                                                has any.
                                            </span>
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-2.5">
                                <Label htmlFor="lyrics" value="Lyrics" />
                                <Textarea
                                    id="lyrics"
                                    name="lyrics"
                                    className="flex-1"
                                    color={
                                        error?.lyricsMessage
                                            ? "failure"
                                            : undefined
                                    }
                                    helperText={
                                        <span className="text-sm">
                                            {error?.lyricsMessage}
                                        </span>
                                    }
                                />
                            </div>
                            <span className="text-sm text-secondary text-center">
                                {error?.message}
                            </span>
                            <div className="flex justify-end gap-7">
                                <Button
                                    onClick={() => navigate(-1)}
                                    className="text-nowrap focus:ring-0 h-full border border-secondary text-secondary"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="failure"
                                    className="text-nowrap focus:ring-0 h-full"
                                    type="submit"
                                    isProcessing={
                                        navigation.state === "submitting"
                                    }
                                    processingSpinner={
                                        <CustomTailSpin small white />
                                    }
                                >
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    )}
                </Await>
            </Suspense>
        </MainBodyContainer>
    );
};

export default UploadSongPage;

export const loader = () => {
    return defer({ albums: getAllAlbums(true) });
};

export const action = async ({ request }) => {
    const formData = await request.formData();
    try {
        const data = await addSong(formData);
        if (!data || !data.insertedId)
            throw { status: 500, message: "An unexpected error occurred." };
        return redirect(`/songs/${data.insertedId}`);
    } catch (error) {
        if (error.status === 400) return { ...error, status: null };
        throw error;
    }
};
