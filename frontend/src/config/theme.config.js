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
        base: "block pb-4 font-semibold text-lg",
        active: {
            on: "text-secondary border-b-2 border-b-secondary",
            off: "text-neutrals-700 border-0 hover:text-baseblack",
        },
    },
    toggle: {
        base: "inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden",
        icon: "h-6 w-6 shrink-0",
    },
};
