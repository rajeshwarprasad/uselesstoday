const https = require("https");
const querystring = require("querystring");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("./asyncHandler");

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function siteverify(secret, token, remoteip) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify({ secret, response: token, remoteip });
        const parsed = new URL(SITEVERIFY_URL);

        const options = {
            hostname: parsed.hostname,
            port: 443,
            path: parsed.pathname,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(postData),
            },
        };

        const r = https.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
                try {
                    resolve(JSON.parse(body));
                } catch {
                    reject(new Error("Bad JSON from siteverify"));
                }
            });
        });

        r.on("error", reject);
        r.setTimeout(10000, () => {
            r.destroy();
            reject(new Error("Timeout"));
        });

        r.write(postData);
        r.end();
    });
}

const verifyTurnstile = asyncHandler(async (req, res, next) => {
    const token = req.body?.["cf-turnstile-response"];

    if (!token) {
        throw ApiError.badRequest("Turnstile token is required");
    }

    if (!process.env.TURNSTILE_SECRET) {
        console.error("TURNSTILE_SECRET is not set");
        throw ApiError.internalServerError("Server configuration error");
    }

    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "";

    const result = await siteverify(process.env.TURNSTILE_SECRET, token, clientIp);

    if (!result.success) {
        throw ApiError.forbidden("Turnstile verification failed");
    }

    next();
});

module.exports = verifyTurnstile;
