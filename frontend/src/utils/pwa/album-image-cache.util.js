/**
 * @fileoverview Album cover prefetch
 * Downloads album cover images into the service worker's `album-images`
 * cache so covers show offline without having been viewed online first.
 */

import backendURL from "../../config/backend-url.config";

/**
 * Cache Storage name shared with the Workbox `CacheFirst` rule for album
 * covers in `frontend/vite.config.js`. Keep the two names equal.
 * @type {string}
 */
export const ALBUM_IMAGE_CACHE = "album-images";

/**
 * Maximum number of cover downloads running at the same time
 * @type {number}
 */
const MAX_CONCURRENT_DOWNLOADS = 4;

/**
 * Downloads one cover into the cache
 *
 * Skips a cover that is already cached. Only a successful response is
 * stored, so an error page never replaces a missing cover.
 *
 * @param {Cache} cache - Open `album-images` cache
 * @param {string} url - Absolute cover URL
 * @returns {Promise<void>}
 */
const cacheCover = async (cache, url) => {
  if (await cache.match(url)) return;
  const response = await fetch(url);
  if (response.ok) await cache.put(url, response);
};

/**
 * Prefetches the cover of every album into the `album-images` cache
 *
 * Best effort: runs at most four downloads at a time, skips albums without
 * a cover, and ignores any failure (the cover is then cached when first
 * viewed). Does nothing when Cache Storage is unavailable. Never throws.
 *
 * @param {Array<{photoLink?: string|null}>} albums - Albums with an optional `photoLink` path
 * @returns {Promise<void>} Resolves when every download has finished or failed
 */
export const prefetchAlbumImages = async (albums) => {
  try {
    if (typeof caches === "undefined") return;
    const urls = albums
      .filter((album) => album.photoLink)
      .map((album) => backendURL + album.photoLink);
    if (urls.length === 0) return;

    const cache = await caches.open(ALBUM_IMAGE_CACHE);
    let next = 0;
    const worker = async () => {
      while (next < urls.length) {
        const url = urls[next++];
        try {
          await cacheCover(cache, url);
        } catch {
          // Skipped: the cover is cached when first viewed.
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(MAX_CONCURRENT_DOWNLOADS, urls.length) }, worker)
    );
  } catch {
    // Prefetch is optional and must never fail the sync.
  }
};
