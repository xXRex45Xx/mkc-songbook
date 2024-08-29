const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
    theme: {
        colors: {
            transparent: "transparent",
            basewhite: "#FCFDFE",
            baseblack: "#40444F",
            primary: "#FABE1F",
            secondary: {
                DEFAULT: "#C9184A",
                600: "#e5255b",
                700: "#ab143f",
                900: "#700d29",
            },
            success: "#A4F4E7",
            warning: "#F4C790",
            error: "#E4626F",
            neutrals: {
                100: "#e4ecf5",
                200: "#ccdbeb",
                700: "#6b84a6",
            },
        },
        extend: {},
    },
    plugins: [flowbite.plugin()],
};
