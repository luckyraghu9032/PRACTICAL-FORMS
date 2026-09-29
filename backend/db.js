const { Pool } = require('pg');

// Use the connection string from .env, or fallback to individual env variables if needed
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // If you are connecting to a hosted DB (like Supabase, Render, Heroku), you might need ssl enabled:
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.message);
    } else {
        console.log('Successfully connected to PostgreSQL at:', res.rows[0].now);
    }
});

module.exports = pool;
