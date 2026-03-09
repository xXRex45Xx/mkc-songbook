/**
 * @fileoverview Button theme configurations for the application
 * Contains various button styling themes for different contexts including
 * base buttons, upload buttons, form buttons, and button groups
 */

/**
 * Base button theme configuration
 * Defines common button styles with flexbox layout and focus states
 * Used as foundation for other button themes
 * @type {Object}
 * @property {string} base - Base button classes for flex layout and focus
 * @property {Object} size - Button size variants
 * @property {string} size.xxs - Extra small button padding
 */
export const buttonTheme = {
    base: "group flex items-center justify-center focus:outline-none",
    size: {
        xxs: "p-0",
    },
};

/**
 * Upload button theme configuration
 * Specific styling for small upload buttons used in file upload contexts
 * @type {Object}
 * @property {Object} size - Button size variants
 * @property {string} size.xs - Small button padding and text size
 * @property {Object} inner - Inner container styling
 * @property {string} inner.base - Flex layout for icon-text gap
 */
export const uploadButtonTheme = {
    size: { xs: "text-xs px-3 py-2" },
    inner: { base: "flex gap-2" },
};

/**
 * Upload form button theme configuration
 * Extended styling for buttons within upload forms
 * Includes transition effects and focus handling for interactive states
 * @type {Object}
 * @property {string} base - Base classes for transitions and focus
 * @property {Object} size - Button size variants
 * @property {string} size.lg - Large button text and padding
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
 * Handles border radius and spacing for adjacent buttons in a group
 * @type {Object}
 * @property {string} base - Base classes for flex layout and gap
 * @property {Object} position - Position-specific variants for button groups
 * @property {string} position.start - First button styling (rounded right)
 * @property {string} position.middle - Middle button styling (no border radius)
 * @property {string} position.end - Last button styling (rounded left)
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
 * Includes transition animations and full width layout for form actions
 * @type {Object}
 * @property {Object} inner - Inner container styling
 * @property {string} inner.base - Flex layout with transition effects
 * @property {Object} size - Button size variants
 * @property {string} size.lg - Large button padding and text size
 */
export const formButtonTheme = {
    inner: {
        base: "flex items-stretch transition-all duration-200 font-semibold w-full justify-center",
    },
    size: {
        lg: "px-5 py-2.5 text-lg",
    },
};
