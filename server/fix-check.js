require('dotenv').config();
const db = require('./db');
(async () => {
  try {
    await db.query(`ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;`);
    console.log("CONSTRAINT DROPPED");
  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
})();
