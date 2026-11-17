/**
 * @fileoverview Vite build configuration
 * Configures React and SVG plugins for the build process
 * @type {import('vite').UserConfig}
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		svgr(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: [
				"favicon.ico",
				"apple-touch-icon.png",
				"maskable_icon.png",
				"logo.svg",
			],
			devOptions: {
				enabled: true,
				type: "module",
			},
			manifest: {
				id: "/",
				name: "MKC Choir Songbook",
				short_name: "MKC Songbook",
				description: "A collection of the MKC Choir songs.",
				icons: [
					{
						src: "/android-chrome-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/android-chrome-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "/android-chrome-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/maskable_icon.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "/apple-touch-icon.png",
						sizes: "180x180",
						type: "image/png",
						purpose: "any",
					},
				],
				theme_color: "#FABE1F",
				background_color: "#FCFDFE",
				display: "standalone",
				display_override: ["standalone", "minimal-ui"],
				orientation: "portrait",
				categories: ["music"],
				scope: "/",
				start_url: "/?source=pwa",
				shortcuts: [
					{
						name: "Songs",
						url: "/songs",
						icons: [
							{ src: "/android-chrome-192x192.png", sizes: "192x192" },
						],
					},
					{
						name: "Albums",
						url: "/albums",
						icons: [
							{ src: "/android-chrome-192x192.png", sizes: "192x192" },
						],
					},
					{
						name: "Playlists",
						url: "/playlists",
						icons: [
							{ src: "/android-chrome-192x192.png", sizes: "192x192" },
						],
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,png,svg,ico,webmanifest,html}"],
				navigateFallback: "/index.html",
				navigateFallbackDenylist: [/^\/api/],
				navigationPreload: true,
				runtimeCaching: [
					{
						// Audio is streamed with range requests and cached explicitly
						// in IndexedDB by the app, so it must never enter the HTTP cache.
						urlPattern: /\/api\/song\/[^/]+\/audio/i,
						handler: "NetworkOnly",
					},
					{
						urlPattern: /\/api\/song\b/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-songs",
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 7 * 24 * 60 * 60,
							},
							cacheableResponse: { statuses: [0, 200] },
						},
					},
					{
						urlPattern: /\/api\/album\b/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-albums",
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 7 * 24 * 60 * 60,
							},
							cacheableResponse: { statuses: [0, 200] },
						},
					},
					{
						// Album cover images served from /static/albums/images
						urlPattern: ({ url }) =>
							url.pathname.startsWith("/static/albums/images"),
						handler: "CacheFirst",
						options: {
							cacheName: "album-images",
							expiration: {
								maxEntries: 120,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
							cacheableResponse: { statuses: [0, 200] },
						},
					},
					{
						// Server playlists
						urlPattern: /\/api\/playlist\b/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-playlists",
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 40,
								maxAgeSeconds: 7 * 24 * 60 * 60,
							},
							cacheableResponse: { statuses: [0, 200] },
						},
					},
					{
						// Signed-in session: cached so a logged-in user survives an
						// offline reload; the IndexedDB user copy is the second fallback.
						urlPattern: /\/api\/user\/current-user\b/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-user",
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 7 * 24 * 60 * 60,
							},
							cacheableResponse: { statuses: [0, 200] },
						},
					},
					{
						// User favorites
						urlPattern: /\/api\/user\/favorites\b/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-favorites",
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 7 * 24 * 60 * 60,
							},
							cacheableResponse: { statuses: [0, 200] },
						},
					},
				],
			},
		}),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;

					if (id.includes("flowbite-react") || id.includes("flowbite")) {
						return "ui";
					}

					if (id.includes("@dnd-kit")) {
						return "dragdrop";
					}

					if (id.includes("@react-oauth") || id.includes("react-loader-spinner")) {
						return "auth-and-feedback";
					}

					return "vendor";
				},
			},
		},
	},
});
