import MainBodyContainer from "../components/main-body-container.component";
import image3 from "../assets/image3.svg";
import { Card } from "flowbite-react";
const AlbumsPage = () => {
	return (
		<MainBodyContainer title={"Recent Albums"}>
			<div className="flex gap-6">
				<Card>
					<h2 className="text-lg font-bold">#23</h2>
					<img src={image3} alt="Album cover" className="w-full h-auto" />
					<h3 className="text-base-black text-[16px] font-inter font-semibold leading-[120%]">
						Album Name
					</h3>
					<p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
						2024 - 16 songs
					</p>
				</Card>
				<Card>
					<h2 className="text-lg font-bold">#24</h2>
					<img src={image3} alt="Album cover" className="w-full h-auto" />
					<h3 className="text-base-black text-[16px] font-inter font-semibold leading-[120%]">
						Album Name
					</h3>
					<p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
						2024 - 16 songs
					</p>
				</Card>
				<Card>
					<h2 className="text-lg font-bold">#24</h2>
					<img src={image3} alt="Album cover" className="w-full h-auto" />
					<h3 className="text-base-black text-[16px] font-inter font-semibold leading-[120%]">
						Album Name
					</h3>
					<p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
						2024 - 16 songs
					</p>
				</Card>
				<Card>
					<h2 className="text-lg font-bold">#24</h2>
					<img src={image3} alt="Album cover" className="w-full h-auto" />
					<h3 className="text-base-black text-[16px] font-inter font-semibold leading-[120%]">
						Album Name
					</h3>
					<p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
						2024 - 16 songs
					</p>
				</Card>
				<Card>
					<h2 className="text-lg font-bold">#24</h2>
					<img src={image3} alt="Album cover" className="w-full h-auto" />
					<h3 className="text-base-black text-[16px] font-inter font-semibold leading-[120%]">
						Album Name
					</h3>
					<p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
						2024 - 16 songs
					</p>
				</Card>
				<Card>
					<h2 className="text-lg font-bold">#24</h2>
					<img src={image3} alt="Album cover" className="w-full h-auto" />
					<h3 className="text-base-black text-[16px] font-inter font-semibold leading-[120%]">
						Album Name
					</h3>
					<p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
						2024 - 16 songs
					</p>
				</Card>
			</div>
			<h1 className="text-baseblack text-3xl font-bold leading-9">
				All Albums
			</h1>

			<Card>
				<h2 className="text-lg font-bold">#24</h2>
				<img src={image3} alt="Album cover" className="w-full h-auto" />
				<h3 className="text-base-black text-[16px] font-inter font-semibold leading-[120%]">
					Album Name
				</h3>
				<p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
					2024 - 16 songs
				</p>
			</Card>
		</MainBodyContainer>
	);
};
export default AlbumsPage;
