import HorizontalAlbumCard from "./horizontal-album-card.component";
import backendURL from "../config/backend-url.config";
import SongsTable from "./songs-table.component";
import SongCollectionTools from "./song-collection-tools.component";

const AlbumViewer = ({ album }) => {
	const handleShare = async () => {
		try {
			await navigator.share({
				title: `MKC Choir Songbook Album - ${album.name}`,
				url: window.location.href,
			});
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="flex flex-col gap-5 w-full">
			<SongCollectionTools handleShare={handleShare} />
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
