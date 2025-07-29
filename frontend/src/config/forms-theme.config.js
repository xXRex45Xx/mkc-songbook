/**
 * @fileoverview Form theme configurations for the application
 * Contains various form element styling themes
 */

/**
 * Select input theme configuration
 * Defines styling for select dropdowns
 * @type {Object}
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
 * Styling for search input fields with custom appearance
 * @type {Object}
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
 * Styling for range input sliders
 * @type {Object}
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
 * Styling for numeric input fields with custom appearance
 * @type {Object}
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
 * Styling for password fields with right icon support
 * @type {Object}
 */
export const passwordInputTheme = {
	field: {
		rightIcon: {
			base: "absolute inset-y-0 right-0 flex items-center pr-3",
		},
	},
};
