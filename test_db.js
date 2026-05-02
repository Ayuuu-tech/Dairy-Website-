const { Pool } = require('pg');
require('dotenv').config({path: './server/.env'});
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
async function test() {
  try {
    const { rows } = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'subscriptions'");
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
