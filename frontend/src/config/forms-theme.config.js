/**
 * @fileoverview Form theme configurations for the application
 * Contains various form element styling themes including select inputs,
 * search inputs, range sliders, number inputs, and password fields
 */

/**
 * Select input theme configuration
 * Defines styling for select dropdowns with focus states and color variants
 * @type {Object}
 * @property {Object} field - Field-level configuration
 * @property {Object} field.select - Select element styling
 * @property {string} field.select.base - Base classes for focus and background
 * @property {Object} field.select.colors - Color variant configurations
 * @property {string} field.select.colors.gray - Gray variant classes
 * @property {Object} field.select.withAddon - Addon positioning
 * @property {string} field.select.withAddon.off - Left rounded class
 * @property {Object} field.select.sizes - Size variants
 * @property {string} field.select.sizes.md - Medium padding and text size
 */
export const selectTheme = {
	field: {
		select: {
			base: "border-none focus:ring-0 bg-basewhite",
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

/**
 * Search input theme configuration
 * Styling for search input fields with custom appearance and icon support
 * @type {Object}
 * @property {string} base - Base flex layout for search container
 * @property {Object} field - Field-level configuration
 * @property {Object} field.input - Input element styling
 * @property {string} field.input.base - Base classes for appearance and spinners
 * @property {Object} field.input.colors - Color variant configurations
 * @property {string} field.input.colors.gray - Gray variant border and text
 * @property {Object} field.input.withAddon - Addon positioning
 * @property {string} field.input.withAddon.off - Rounded corners disabled
 * @property {Object} field.input.sizes - Size variants
 * @property {string} field.input.sizes.md - Medium size dimensions
 */
export const searchInputTheme = {
	base: "flex flex-1",
	field: {
		input: {
			base: "block border-x-0 min-h-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
			colors: {
				gray: "border-y-neutrals-200 text-baseblack",
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

/**
 * Range slider theme configuration
 * Styling for range input sliders with custom track and thumb appearance
 * @type {Object}
 * @property {Object} root - Root container configuration
 * @property {string} root.base - Base flex layout for slider
 * @property {Object} field - Field-level configuration
 * @property {string} field.base - Relative positioning for absolute elements
 * @property {Object} field.input - Input element styling
 * @property {string} field.input.base - Base classes for thumb and progress styling
 */
export const rangeSliderTheme = {
	root: {
		base: "flex",
	},
	field: {
		base: "relative w-full",
		input: {
			base: "-translate-y-1/2 absolute z-10 [&::-moz-range-progress]:h-0 w-full cursor-pointer appearance-none rounded-lg bg-transparent",
		},
	},
};

/**
 * Number input theme configuration
 * Styling for numeric input fields with custom appearance and spinner controls
 * @type {Object}
 * @property {Object} field - Field-level configuration
 * @property {string} field.base - Relative positioning for spinners
 * @property {Object} field.input - Input element styling
 * @property {string} field.input.base - Base classes for centered text and spinner appearance
 */
export const numberInputTheme = {
	field: {
		base: "relative",
		input: {
			base: "inline text-center w-11 text-base font-bold border disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
		},
	},
};

/**
 * Password input theme configuration
 * Styling for password fields with right icon support for show/hide toggle
 * @type {Object}
 * @property {Object} field - Field-level configuration
 * @property {Object} field.rightIcon - Right-side icon positioning
 * @property {string} field.rightIcon.base - Absolute positioning for icon
 */
export const passwordInputTheme = {
	field: {
		rightIcon: {
			base: "absolute inset-y-0 right-0 flex items-center pr-3",
		},
	},
};
