/**
 * @fileoverview Fresh result hook
 * Shows a result that is already available on the device right away and swaps
 * in the server's answer for the same request once it arrives.
 */

import { useEffect, useState } from "react";

/**
 * Returns the local result until the server's promise resolves, then its value
 *
 * The server value is used only for the promise it came from: when a new
 * search starts (a new `freshPromise`), the new local result shows at once and
 * a late answer to the old search is ignored. A rejected promise, or no
 * promise, keeps the local result.
 *
 * @template T
 * @param {T} local - Result already available on the device
 * @param {Promise<T>|null|undefined} freshPromise - Server answer for the same request, or nothing when it is not asked for
 * @returns {T} The server value once it has resolved for `freshPromise`, otherwise `local`
 * @example
 * const songData = useFreshResult(loaderData.songData, loaderData.freshSongData);
 */
export const useFreshResult = (local, freshPromise) => {
	const [fresh, setFresh] = useState({ promise: null, value: undefined });

	useEffect(() => {
		if (!freshPromise) return undefined;
		let active = true;
		freshPromise
			.then((value) => {
				if (active) setFresh({ promise: freshPromise, value });
			})
			.catch(() => {});
		return () => {
			active = false;
		};
	}, [freshPromise]);

	return freshPromise && fresh.promise === freshPromise ? fresh.value : local;
};
