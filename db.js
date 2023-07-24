const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'weatherapp',
  password: 'Manal Magdy10$',
  port: 5432, 
});

async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = pool;