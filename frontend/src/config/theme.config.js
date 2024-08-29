export const navbarTheme = {
    root: {
        base: "px-20 pt-6",
        inner: {
            base: "flex flex-wrap items-center justify-between",
        },
    },
    brand: {
        base: "pb-6 flex items-center",
    },
    collapse: {
        base: "w-auto md:block",
        list: "mt-0 flex flex-row space-x-8",
        hidden: {
            on: "hidden",
            off: "",
        },
    },
    link: {
        base: "block pb-4 text-neutrals-700",
        active: {
            on: "text-secondary border-b-2 border-b-secondary",
            off: "border-b border-gray-100 text-gray-700 hover:bg-gray-50 md:border-0 md:hover:bg-transparent md:hover:text-cyan-700",
        },
        disabled: {
            on: "text-gray-400 hover:cursor-not-allowed",
            off: "",
        },
    },
    toggle: {
        base: "inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden",
        icon: "h-6 w-6 shrink-0",
    },
};
