/**
 * @fileoverview Card theme configurations for the application
 * Contains styling themes for various card components including album cards,
 * favorites cards, and horizontal card layouts
 */

/**
 * Album card theme configuration
 * Styling for album display cards with hover effects and dark mode support
 * @type {Object}
 * @property {Object} root - Root element configuration
 * @property {string} root.base - Base classes for flex layout, borders, and shadow transitions
 */
export const albumCardTheme = {
	root: {
		base: "flex rounded-lg border border-gray-200 transistion-shadow duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800",
	},
};

/**
 * Favorites card theme configuration
 * Styling for favorite items with primary color borders and hover effects
 * @type {Object}
 * @property {Object} root - Root element configuration
 * @property {string} root.base - Base classes for flex layout with primary border
 */
export const favoritesCardTheme = {
	root: {
		base: "flex rounded-lg border border-primary transition-shadow duration-300 hover:shadow-md",
	},
};

/**
 * Horizontal card theme configuration
 * Styling for horizontally oriented cards with dark mode support
 * @type {Object}
 * @property {Object} root - Root element configuration
 * @property {string} root.base - Base classes for flex layout with dark theme support
 */
export const horizontalCardTheme = {
	root: {
		base: "flex rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800",
	},
};

/**
 * Favorites horizontal card theme configuration
 * Styling for horizontally oriented favorite items with primary borders
 * @type {Object}
 * @property {Object} root - Root element configuration
 * @property {string} root.base - Base classes for flex layout with primary border
 */
export const favoritesHorizontalCardTheme = {
	root: {
		base: "flex rounded-lg border border-primary",
	},
};
