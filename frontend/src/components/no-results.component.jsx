/**
 * @fileoverview Empty state shown when a list or search returns nothing
 */

import noResultsIcon from "../assets/no-results.svg";

/**
 * No Results Component
 *
 * Centered illustration with a "No Results Found" heading and an optional
 * line of detail, rendered in place of an empty list.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.description] - Detail line under the heading
 * @returns {JSX.Element} Empty state
 */
const NoResults = ({ description }) => (
	<div
		role="status"
		className="flex flex-col items-center gap-2 self-stretch py-10 text-center"
	>
		<img src={noResultsIcon} alt="" className="w-52 md:w-64" />
		<h2 className="text-xl md:text-2xl font-bold text-neutrals-900">
			No Results Found
		</h2>
		{description && (
			<p className="text-sm md:text-base text-neutrals-800">{description}</p>
		)}
	</div>
);

export default NoResults;
