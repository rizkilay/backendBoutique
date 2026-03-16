require('dotenv').config();
const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
        family: 4
    };

const pool = new Pool(poolConfig);

async function test() {
    console.log('Testing connection to:', poolConfig.host || 'DATABASE_URL');
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Success! Database time:', res.rows[0].now);
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        if (err.code === 'ENOTFOUND') {
            console.error('Hint: The hostname could not be resolved. If on Vercel, ensure you are using the Supabase Connection Pooler hostname (IPv4).');
        }
        process.exit(1);
    }
}

test();
