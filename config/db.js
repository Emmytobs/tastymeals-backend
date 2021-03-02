const { Pool } = require('pg');

// PostgreSQL config goes here
const pool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
})

pool.connect()
    .then(() => console.log('Postgres Database connected successfully'))
    .catch((error) => console.error('Error: Database couldn\'t connect'))

module.exports = pool;