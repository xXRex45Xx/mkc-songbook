const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
    theme: {
        colors: {
            transparent: "transparent",
            basewhite: "#FCFDFE",
            baseblack: "#40444F",
            primary: {
                DEFAULT: "#FABE1F",
                400: "#fcd46a",
                500: "#fbc944",
                600: "#efaf05",
                700: "#cb9505",
            },
            secondary: {
                DEFAULT: "#C9184A",
                600: "#e5255b",
                700: "#ab143f",
                900: "#700d29",
            },
            success: {
                DEFAULT: "#A4F4E7",
                100: "#A4F4E7",
                200: "#15B097",
                300: "#0B7B69",
            },
            warning: "#F4C790",
            error: "#E4626F",
            neutrals: {
                100: "#e4ecf5",
                400: "#a2b9d3",
                500: "#8ea7c5",
                200: "#ccdbeb",
                600: "#7c96b6",
                700: "#6b84a6",
                800: "#5F7392",
                900: "#55637a",
                1000: "#4b5364",
            },
        },
        extend: {},
    },
    plugins: [flowbite.plugin()],
};
