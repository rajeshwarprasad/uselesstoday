const errorHandler = (err, req, res, next) => {
    const status = err.statusCode || 500;

    if (status >= 500) {
        console.error("Server error:", err);
    }

    if (err.code === '23505') {
        return res.status(409).json({ error: "Resource already exists" });
    }

    const message = status >= 500
        ? "Internal Server Error"
        : err.message;

    res.status(status).json({ error: message });
};

const notFoundHandler = (req, res, next) => {
    res.status(404).json({ error: "Not Found" });
};

module.exports = { errorHandler, notFoundHandler };
