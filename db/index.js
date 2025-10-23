const {Pool} = require('pg');

const pool = new Pool({
    port: process.env.DATABASE_PORT,
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = {
    query: (text, params) => {
        return pool.query(text, params)
            .then(res => {
                return res;
            });
    },
    pool: pool
}
