const mysql = require('mysql2');
require('dotenv').config();

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'carwash_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// Use promise wrapper for async/await
const promisePool = pool.promise();

module.exports = promisePool;
