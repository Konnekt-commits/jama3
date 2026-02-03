const mysql = require('mysql2/promise');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';

// Configuration pour Cloud SQL (socket Unix) ou local (TCP)
const poolConfig = {
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jama3_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Si DB_HOST commence par /cloudsql/, utiliser socketPath
if (dbHost.startsWith('/cloudsql/')) {
    poolConfig.socketPath = dbHost;
} else {
    poolConfig.host = dbHost;
    poolConfig.port = process.env.DB_PORT || 3306;
}

const pool = mysql.createPool(poolConfig);

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Connexion MySQL établie avec succès');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Erreur de connexion MySQL:', error.message);
        return false;
    }
};

module.exports = pool;
module.exports.testConnection = testConnection;
