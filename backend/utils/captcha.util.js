/**
 * Captcha utilities.
 * Verifies Cloudflare Turnstile tokens with the siteverify API.
 * @module utils/captcha
 */

/**
 * Tells whether captcha checks run. They run when TURNSTILE_SECRET_KEY is set and
 * always in production, where a missing key makes them fail closed. Outside
 * production without a key they are off, so local development and tests need no keys.
 *
 * @returns {boolean} True when logins may be asked for a captcha
 */
export const isCaptchaEnabled = () =>
	Boolean(process.env.TURNSTILE_SECRET_KEY) ||
	process.env.NODE_ENV === "production";

/**
 * Verifies a Turnstile token. Fails when TURNSTILE_SECRET_KEY is unset.
 *
 * @param {string} token - Token the widget put in the form (`cf-turnstile-response`)
 * @param {string} [remoteIp] - Client address, sent to Cloudflare as a hint
 * @returns {Promise<boolean>} True when Cloudflare accepts the token
 * @example
 * if (!(await verifyCaptcha(req.body.captchaToken, req.ip))) throw new ForbiddenError("Captcha failed");
 */
export const verifyCaptcha = async (token, remoteIp) => {
	const secret = process.env.TURNSTILE_SECRET_KEY;
	if (!secret) return false;
	if (typeof token !== "string" || !token || token.length > 2048) return false;

	const body = new URLSearchParams({ secret, response: token });
	if (remoteIp) body.set("remoteip", remoteIp);

	try {
		const response = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{ method: "POST", body, signal: AbortSignal.timeout(5000) }
		);
		const result = await response.json();
		return result.success === true;
	} catch {
		return false;
	}
};
