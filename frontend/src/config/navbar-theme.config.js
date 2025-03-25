/**
 * @fileoverview Navigation bar theme configuration
 * Defines styling for the application's navigation bar components
 */

/**
 * Navbar theme configuration
 * Contains styling for root, brand, collapse, and link elements
 * Includes responsive design classes for mobile and desktop views
 * @type {Object}
 */
export const navbarTheme = {
    root: {
        base: "px-5 pt-6 md:px-10 lg:px-16",
        inner: {
            base: "flex flex-wrap items-center justify-between",
        },
    },
    brand: {
        base: "pb-6 flex items-center",
    },
    collapse: {
        base: "w-full max-w-[400px]  md:w-auto md:max-w-none md:block",
        list: "mt-0 flex flex-row justify-between md:space-x-8",
        hidden: {
            on: "overflow-auto",
            off: "",
        },
    },
    link: {
        base: "block pb-2 font-semibold text-sm md:text-lg md:pb-4",
        active: {
            on: "text-secondary border-b-2 border-b-secondary mb-2 md:mb-0",
            off: "text-neutrals-700 border-0 hover:text-baseblack",
        },
    },
};
