const AlbumCardContainer = ({ children, name, info }) => (
	<main className="py-10 px-20 flex flex-col flex-1 items-start gap-7 overflow-auto">
		{name && (
			<h1 className="text-base-black text-[16px] font-inter font-semibold leading-[120%]">
				{name}
			</h1>
		)}
		{info && (
			<h1 className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
				{info}
			</h1>
		)}

		{children}
	</main>
);

export default AlbumCardContainer;
