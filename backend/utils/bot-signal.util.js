/**
 * Bot signal utilities.
 * Cheap request-header checks for scripted clients. Node cannot see TLS
 * fingerprints, so this does not replace a proxy-supplied JA3/JA4 score.
 * @module utils/bot-signal
 */

const SCRIPT_USER_AGENT =
	/^(curl|wget|python|aiohttp|httpx|go-http-client|okhttp|java|libwww|node|axios|undici|got|postman|insomnia|httpie|scrapy|php|ruby|perl|headlesschrome)|\b(bot|spider|crawler|headless|phantomjs|selenium)\b/i;

/**
 * Tells whether a request looks like it came from a script instead of a browser.
 * Browsers always send a User-Agent and an Accept-Language.
 *
 * @param {Request} req - Express request object
 * @returns {boolean} True when the headers match a script client
 * @example
 * isScriptLike({ headers: { "user-agent": "curl/8.4.0" } }); // true
 */
export const isScriptLike = (req) => {
	const userAgent = req.headers["user-agent"];
	if (!userAgent) return true;
	if (SCRIPT_USER_AGENT.test(userAgent)) return true;
	return !req.headers["accept-language"];
};
