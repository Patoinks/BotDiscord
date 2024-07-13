// db.js
const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables from .env file

const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10, // Adjust based on your needs
});

module.exports = dbPool;
