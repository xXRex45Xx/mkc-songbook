/**
 * @fileoverview Vite build configuration
 * Configures React and SVG plugins for the build process
 * @type {import('vite').UserConfig}
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
    plugins: [react(), svgr()],
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
