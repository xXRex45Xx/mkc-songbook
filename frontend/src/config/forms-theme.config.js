export const selectTheme = {
    field: {
        select: {
            base: "border-none",
            colors: {
                gray: "text-baseblack bg-neutrals-100 focus:outline-none",
            },
            withAddon: {
                off: "rounded-l-lg",
            },
            sizes: {
                md: "py-2.5 px-5",
            },
        },
    },
};

export const searchInputTheme = {
    base: "flex flex-1",
    field: {
        input: {
            base: "block border-x-0 min-h-full",
            colors: {
                gray: "border-y-neutrals-200",
            },
            withAddon: {
                off: "rounded-none",
            },
            sizes: {
                md: "py-2.5 text-sm w-64 min-w-28",
            },
        },
    },
};
