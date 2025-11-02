/**
 * Music Element Component
 *
 * Displays a musical attribute (chord, tempo, rhythm) with consistent styling.
 * Shows the type label above and the detail value below.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.type - Type of musical element (e.g., "chord", "tempo", "rhythm")
 * @param {string|number} props.detail - Value of the musical element
 */
const MusicElement = ({ type, detail }) => (
	<div className="flex flex-col justify-center items-end gap-1">
		<span className="text-xs md:text-sm font-semibold text-neutrals-900 uppercase">
			{type}
		</span>
		<span className="text-xs md:text-lg font-normal text-secondary">
			{detail}
		</span>
	</div>
);

export default MusicElement;
