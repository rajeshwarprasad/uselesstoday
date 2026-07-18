const xss = require("xss");

const sanitize = (obj) => {
    if (typeof obj === "string") return xss(obj);
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj && typeof obj === "object") {
        const clean = {};
        for (const [key, val] of Object.entries(obj)) {
            clean[key] = sanitize(val);
        }
        return clean;
    }
    return obj;
};

const xssSanitize = (req, _res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    next();
};

module.exports = xssSanitize;
