const { Pool }   = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10, // maximum number of clients in the pool
    idleTimeoutMillis: 30000, // close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // return an error after 2 seconds if connection could not be established
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL pool error:", err);
});

const query = (text, params) => pool.query(text, params);

const withTransaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    }   catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }   finally {
        client.release();
    }
};

module.exports = {pool, query, withTransaction};
