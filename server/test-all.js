require('dotenv').config();
const db = require('./db');
(async () => {
  try {
    const { rows } = await db.query(`SELECT id FROM users LIMIT 1`);
    console.log("USER ID:", rows[0].id);
  } catch (e) {
    console.error("DB ERROR:", e.message);
  }
  process.exit(0);
})();
