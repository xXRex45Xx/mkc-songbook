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
			registerType: "prompt",
			includeAssets: [
				"favicon.ico",
				"apple-touch-icon.png",
				"maskable_icon.png",
			],
			devOptions: {
				enabled: false,
				type: "module"
			},
			manifest: {
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
						src: "/android-chrome-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/apple-touch-icon.png",
						sizes: "180x180",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/maskable_icon.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
				theme_color: "#FABE1F",
				background_color: "#FCFDFE",
				display: "standalone",
				scope: "/",
				start_url: "/",
			},
			workbox: {
				runtimeCaching: [
					{
						urlPattern: /\/api\/song\/.*\/audio/i,
						handler: "NetworkOnly",
					},
					{
						urlPattern: /\/api\/song.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-songs",
							networkTimeoutSeconds: 10,
						},
					},
					{
						urlPattern: /\/api\/album.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-albums",
							networkTimeoutSeconds: 10,
						},
					},
				],
				navigateFallbackDenylist: [/^\/api/],
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
