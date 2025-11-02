/**
 * @fileoverview Vite build configuration
 * Configures React and SVG plugins for the build process
 * @type {import('vite').UserConfig}
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

const PWAManifest = {};

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
			manifest: {
				name: "MKC Choir Songbook",
				short_name: "MKC Songbook",
				description: "A collection of the MKC Choir songs.",
				icons: [
					{
						src: "/android-chrome-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "favicon",
					},
					{
						src: "/android-chrome-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "favicon",
					},
					{
						src: "/apple-touch-icon.png",
						sizes: "180x180",
						type: "image/png",
						purpose: "apple touch icon",
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
				orientation: "portrait-primary",
			},
		}),
	],
});
