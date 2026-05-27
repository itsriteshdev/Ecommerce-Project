const { Pool } = require('pg');
require('dotenv').config();

let dbUrl = process.env.DB_URL || '';
if (dbUrl.startsWith('jdbc:postgresql://')) {
  dbUrl = dbUrl.replace('jdbc:postgresql://', 'postgresql://');
}
if (dbUrl.includes('?')) {
  dbUrl = dbUrl.split('?')[0];
}

let connectionConfig = {};

if (dbUrl) {
  const urlParts = dbUrl.replace('postgresql://', '');
  if (!urlParts.includes('@') && process.env.DB_USERNAME && process.env.DB_PASSWORD) {
    const encodedUser = encodeURIComponent(process.env.DB_USERNAME);
    const encodedPass = encodeURIComponent(process.env.DB_PASSWORD);
    dbUrl = `postgresql://${encodedUser}:${encodedPass}@${urlParts}`;
  }
  connectionConfig.connectionString = dbUrl;
} else {
  connectionConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: 'aws-1-ap-southeast-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres'
  };
}

connectionConfig.ssl = {
  rejectUnauthorized: false
};

const pool = new Pool(connectionConfig);

// Test query
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to PostgreSQL database successfully at:', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => {
    console.log(`[SQL] ${text} | Params: ${JSON.stringify(params || [])}`);
    return pool.query(text, params);
  },
  transaction: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
      throw err;
    } finally {
      client.release();
    }
  },
  pool
};
