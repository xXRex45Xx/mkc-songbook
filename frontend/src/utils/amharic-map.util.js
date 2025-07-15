/**
 * @fileoverview Amharic character mapping utility
 * Provides functionality for handling similar Amharic characters in search operations
 */

/**
 * Maps Amharic characters to their similar variants in regex pattern form
 * Used for flexible text matching that accounts for character variants
 * For example, 'ሀ' matches any of '[ሀሃሐሓኀኃኻ]'
 * @type {Object.<string, string>}
 */
export const similarRegexMap = {
	ሀ: "[ሀሃሐሓኀኃኻ]",
	ሁ: "[ሁሑኁኹ]",
	ሂ: "[ሂሒኂኺ]",
	ሃ: "[ሀሃሐሓኀኃኻ]",
	ሄ: "[ሄሔኄኼ]",
	ህ: "[ህሕኅኽ]",
	ሆ: "[ሆሖኆኾ]",
	ሐ: "[ሀሃሐሓኀኃኻ]",
	ሑ: "[ሁሑኁኹ]",
	ሒ: "[ሂሒኂኺ]",
	ሓ: "[ሀሃሐሓኀኃኻ]",
	ሔ: "[ሄሔኄኼ]",
	ሕ: "[ህሕኅኽ]",
	ሖ: "[ሆሖኆኾ]",
	ሠ: "[ሠሰ]",
	ሡ: "[ሡሱ]",
	ሢ: "[ሢሲ]",
	ሣ: "[ሣሳ]",
	ሤ: "[ሤሴ]",
	ሥ: "[ሥስ]",
	ሦ: "[ሦሶ]",
	ሧ: "[ሧሷ]",
	ሰ: "[ሠሰ]",
	ሱ: "[ሡሱ]",
	ሲ: "[ሢሲ]",
	ሳ: "[ሣሳ]",
	ሴ: "[ሤሴ]",
	ስ: "[ሥስ]",
	ሶ: "[ሦሶ]",
	ሷ: "[ሧሷ]",
	ኀ: "[ሀሃሐሓኀኃኻ]",
	ኁ: "[ሁሑኁኹ]",
	ኂ: "[ሂሒኂኺ]",
	ኃ: "[ሀሃሐሓኀኃኻ]",
	ኄ: "[ሄሔኄኼ]",
	ኅ: "[ህሕኅኽ]",
	ኆ: "[ሆሖኆኾ]",
	አ: "[አኣዐዓ]",
	ኡ: "[ኡዑ]",
	ኢ: "[ኢዒ]",
	ኣ: "[አኣዐዓ]",
	ኤ: "[ኤዔ]",
	እ: "[እዕ]",
	ኦ: "[ኦዖ]",
	ኹ: "[ሁሑኁኹ]",
	ኺ: "[ሂሒኂኺ]",
	ኻ: "[ሀሃሐሓኀኃኻ]",
	ኼ: "[ሄሔኄኼ]",
	ኽ: "[ህሕኅኽ]",
	ኾ: "[ሆሖኆኾ]",
	ዐ: "[አኣዐዓ]",
	ዑ: "[ኡዑ]",
	ዒ: "[ኢዒ]",
	ዓ: "[አኣዐዓ]",
	ዔ: "[ኤዔ]",
	ዕ: "[እዕ]",
	ዖ: "[ኦዖ]",
	ጸ: "[ጸፀ]",
	ጹ: "[ጹፁ]",
	ጺ: "[ጺፂ]",
	ጻ: "[ጻፃ]",
	ጼ: "[ጼፄ]",
	ጽ: "[ጽፅ]",
	ጾ: "[ጾፆ]",
	ፀ: "[ጸፀ]",
	ፁ: "[ጹፁ]",
	ፂ: "[ጺፂ]",
	ፃ: "[ጻፃ]",
	ፄ: "[ጼፄ]",
	ፅ: "[ጽፅ]",
	ፆ: "[ጾፆ]",
};

/**
 * Builds a regex pattern string that matches similar Amharic characters
 * For each character in the input string, if it exists in the similarRegexMap,
 * replaces it with its corresponding regex pattern. Otherwise, keeps the original character.
 * @param {string} s - Input string containing Amharic characters
 * @returns {string} A regex pattern string that matches similar characters
 * @example
 * // Returns '[ሀሃሐሓኀኃኻ][ኡዑ]' for input 'ሀዑ'
 */
export const regexBuilder = (s) => {
	let str = "";
	for (let i = 0; i < s.length; i++) {
		const mappedChar = similarRegexMap[s.charAt(i)];
		if (mappedChar) str += mappedChar;
		else str += s.charAt(i);
	}

	return str;
};
