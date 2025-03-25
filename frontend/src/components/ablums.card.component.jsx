/**
 * Album Card Container Component
 *
 * A layout component that wraps album content with consistent padding and styling.
 * Provides optional header sections for name and additional information.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the container
 * @param {string} [props.name] - Optional title text to display at the top
 * @param {string} [props.info] - Optional information text to display below the title
 */
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
