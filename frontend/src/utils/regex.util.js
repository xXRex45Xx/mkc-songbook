/**
 * @fileoverview Email validation regex utility
 * Contains regular expression pattern for validating email addresses
 */

/**
 * Regular expression for validating email addresses
 * Matches standard email format including special characters and subdomains
 * @type {RegExp}
 */
export const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
