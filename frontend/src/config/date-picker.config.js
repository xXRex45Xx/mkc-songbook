/**
 * @fileoverview Date picker theme configuration
 * Contains styling for date picker popup, footer buttons, and view items
 */

/**
 * Date picker popup theme configuration
 * Styling for the date picker popup window and its components
 * @type {Object}
 * @property {Object} popup - Popup window configuration
 * @property {Object} popup.footer - Footer section with action buttons
 * @property {Object} popup.footer.button - Button styling in footer
 * @property {string} popup.footer.button.today - Today button styling
 * @property {string} popup.footer.button.clear - Clear button styling
 * @property {Object} popup.views - View-specific styling
 * @property {Object} popup.views.days - Days view configuration
 * @property {Object} popup.views.days.items - Day item styling
 * @property {Object} popup.views.days.items.item - Individual day item
 * @property {string} popup.views.days.items.item.selected - Selected day styling
 */
export const datePickerTheme = {
	popup: {
		footer: {
			button: {
				today: "bg-secondary text-white hover:bg-secondary-700 focus:ring-0",
				clear:
					"border border-neutrals-400 text-gray-800 hover:bg-gray-100 focus:ring-0",
			},
		},
	},
	views: {
		days: {
			items: {
				item: {
					selected: "bg-secondary text-white hover:bg-secondary-700",
				},
			},
		},
	},
};
