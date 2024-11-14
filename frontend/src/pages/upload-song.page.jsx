import MainBodyContainer from "../components/main-body-container.component";
import { Label, FileInput, TextInput, Select, Textarea } from "flowbite-react";
import { Form } from "react-router-dom";

import "./upload-song.styles.css";

const UploadSongPage = () => (
    <MainBodyContainer title="Upload Song">
        <Form
            className="flex-1 self-stretch flex flex-col py-3.5 px-5 gap-10 items-stretch"
            method="POST"
        >
            <div className="grid grid-cols-2 gap-x-7 gap-y-2.5">
                <div className="flex flex-col gap-2.5">
                    <Label htmlFor="title" value="Song Title" />
                    <TextInput id="title" name="title" type="text" />
                </div>
                <div className="flex flex-col gap-2.5">
                    <Label htmlFor="song-number" value="Song Number" />
                    <TextInput
                        id="song-number"
                        name="song-number"
                        type="number"
                        helperText="The number assigned to the song."
                    />
                </div>
                <div className="flex flex-col gap-2.5">
                    <Label htmlFor="album" value="Album Title (Optional)" />
                    <Select
                        id="album"
                        name="album"
                        helperText="The album the song belongs to."
                    ></Select>
                </div>
                <div className="flex flex-col gap-2.5">
                    <Label
                        htmlFor="video"
                        value="Youtube Video Link (Optional)"
                        helperText="The video link of the song if it has any."
                    />
                    <TextInput id="album" name="album" type="url" />
                </div>
            </div>
            <div className="flex flex-col gap-2.5">
                <Label htmlFor="audio-file" value="Upload Audio" />
                <FileInput
                    id="audio-file"
                    helperText="MP3 or AAC (MAX. 50 MBs)"
                />
            </div>
            <div className="flex-1 flex flex-col gap-2.5">
                <Label htmlFor="lyrics" value="Lyrics" />
                <Textarea id="lyrics" name="lyrics" className="flex-1" />
            </div>
        </Form>
    </MainBodyContainer>
);

export default UploadSongPage;
