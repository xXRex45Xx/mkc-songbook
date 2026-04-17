/**
 * @fileoverview Navigation bar theme configuration
 * Defines styling for the application's navigation bar components including
 * root container, brand/logo area, collapse menu, and navigation links
 */

/**
 * Navbar theme configuration
 * Contains styling for root, brand, collapse, and link elements
 * Includes responsive design classes for mobile and desktop views
 * @type {Object}
 * @property {Object} root - Root container configuration
 * @property {string} root.base - Base padding classes with responsive breakpoints
 * @property {Object} root.inner - Inner container layout
 * @property {string} root.inner.base - Flex layout for navbar items
 * @property {Object} brand - Brand/logo area configuration
 * @property {string} brand.base - Base classes for brand positioning
 * @property {Object} collapse - Collapse/collapsible menu configuration
 * @property {string} collapse.base - Base classes for responsive width
 * @property {string} collapse.list - Navigation list styling
 * @property {Object} collapse.hidden - Hidden state configuration
 * @property {string} collapse.hidden.on - Overflow behavior when hidden
 * @property {string} collapse.hidden.off - Default state (no overflow)
 * @property {Object} link - Navigation link styling
 * @property {string} link.base - Base link classes with responsive text
 * @property {Object} link.active - Active state variants
 * @property {string} link.active.on - Active link styling (secondary color)
 * @property {string} link.active.off - Inactive link styling with hover
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
