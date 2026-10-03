require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS otps (email VARCHAR(255) PRIMARY KEY, otp VARCHAR(10), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    console.log('OTPs table created.');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
