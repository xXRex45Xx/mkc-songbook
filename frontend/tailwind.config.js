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
            secondary: "#C9184A",
            success: "#A4F4E7",
            warning: "#F4C790",
            error: "#E4626F",
            neutrals: {
                700: "#6b84a6",
            },
        },
        extend: {},
    },
    plugins: [flowbite.plugin()],
};
