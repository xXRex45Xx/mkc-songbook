/**
 * @fileoverview Table theme configuration
 * Defines styling for table components including root container, header, and body elements
 */

/**
 * Table theme configuration
 * Contains styling for table root, header, and body elements
 * @type {Object}
 * @property {Object} root - Root container configuration
 * @property {string} root.shadow - Shadow styling for table container
 * @property {Object} head - Header row configuration
 * @property {string} head.base - Base classes for header text styling
 * @property {Object} body - Body rows configuration
 * @property {string} body.base - Base classes for body group styling
 */
export const tableTheme = {
    root: {
        shadow: "",
    },
    head: {
        base: "group/head text-xs uppercase text-gray-700",
    },
    body: { base: "group/body" },
};
