const mysql = require("mysql2/promise");

// Configura según tu XAMPP, normalmente:
// host: 'localhost', user: 'root', password: '', database: 'nombre_db'

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "testdb", // <-- Nombre de la Base de Datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
