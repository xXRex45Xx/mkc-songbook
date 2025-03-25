/**
 * @fileoverview Button theme configurations for the application
 * Contains various button styling themes for different contexts
 */

/**
 * Base button theme configuration
 * Defines common button styles with flexbox layout
 * @type {Object}
 */
export const buttonTheme = {
    base: "group flex items-center justify-center focus:outline-none",
    size: {
        xxs: "p-0",
    },
};

/**
 * Upload button theme configuration
 * Specific styling for small upload buttons
 * @type {Object}
 */
export const uploadButtonTheme = {
    size: { xs: "text-xs px-3 py-2" },
    inner: { base: "flex gap-2" },
};

/**
 * Upload form button theme configuration
 * Extended styling for buttons within upload forms
 * Includes transition effects and focus handling
 * @type {Object}
 */
export const uploadFormButtonTheme = {
    base: "group relative flex items-stretch justify-center text-center font-medium transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow] focus:z-10 focus:outline-none",
    size: {
        lg: "text-lg py-2.5 px-7",
    },
};

/**
 * Button group theme configuration
 * Styling for grouped button components
 * Handles border radius and spacing for adjacent buttons
 * @type {Object}
 */
export const buttonGroupTheme = {
    base: "flex px-5 justify-center items-center gap-7 ",
    position: {
        start: "rounded-r-none",
        middle: "rounded-none border-l-0 pl-0",
        end: "rounded-l-none border-l-0 pl-0",
    },
};

/**
 * Form button theme configuration
 * Styling for buttons within forms
 * Includes transition animations and full width layout
 * @type {Object}
 */
export const formButtonTheme = {
    inner: {
        base: "flex items-stretch transition-all duration-200 font-semibold w-full justify-center",
    },
    size: {
        lg: "px-5 py-2.5 text-lg",
    },
};
