export const buttonTheme = {
    base: "group flex items-center justify-center focus:outline-none",
    size: {
        xxs: "p-0",
    },
};

export const uploadButtonTheme = {
    size: { xs: "text-xs px-3 py-2" },
    inner: { base: "flex gap-2" },
};

export const uploadFormButtonTheme = {
    base: "group relative flex items-stretch justify-center text-center font-medium transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow] focus:z-10 focus:outline-none",
    size: {
        lg: "text-lg py-2.5 px-7",
    },
};

export const buttonGroupTheme = {
    base: "flex px-5 justify-center items-center gap-7 ",
    position: {
        start: "rounded-r-none",
        middle: "rounded-none border-l-0 pl-0",
        end: "rounded-l-none border-l-0 pl-0",
    },
};

export const formButtonTheme = {
    inner: {
        base: "flex items-stretch transition-all duration-200 font-semibold w-full justify-center",
    },
    size: {
        lg: "px-5 py-2.5 text-lg",
    },
};
