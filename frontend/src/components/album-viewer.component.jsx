import HorizontalAlbumCard from "./horizontal-album-card.component";
import backendURL from "../config/backend-url.config";
import SongsTable from "./songs-table.component";
import SongCollectionTools from "./song-collection-tools.component";

const AlbumViewer = ({ album }) => {
	return (
		<div className="flex flex-col gap-5 w-full">
			<SongCollectionTools />
			<HorizontalAlbumCard
				title={album.name}
				year={album.createdAt}
				numOfSongs={album.songs.length}
				imgSrc={backendURL + album.photoLink}
			/>
			<SongsTable songs={album.songs} showOverflow />
		</div>
	);
};

export default AlbumViewer;
