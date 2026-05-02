const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
async function test() {
  try {
    const { rows } = await pool.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'subscriptions'");
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
