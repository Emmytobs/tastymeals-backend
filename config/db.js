const { Pool } = require('pg');

// PostgreSQL config goes here

// const developmentConfig = {
//     user: process.env.PG_USER,
//     password: process.env.PG_PASSWORD,
//     port: process.env.PG_PORT,
//     host: process.env.PG_HOST,
//     database: process.env.PG_DATABASE,
// }
const productionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
}

const pool = new Pool(
    productionConfig
    // process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig
);
    
    
pool.connect()
    .then(() => console.log('Postgres Database connected successfully'))
    .catch((error) => console.log(error))

module.exports = pool;