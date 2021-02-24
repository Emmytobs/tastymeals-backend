const pg = require('pg');

// PostgreSQL config goes here
const client = pg.Client({
    username: 'Postgres',
    password: 'Postgres',
})

module.exports = client;