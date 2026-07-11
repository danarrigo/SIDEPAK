const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const coops = await pool.query("SELECT id, name FROM cooperatives WHERE name ILIKE '%semanan%'");
    console.log("Cooperatives:", coops.rows);

    const members = await pool.query("SELECT id, \"nama_lengkap\", \"cooperativeId\" FROM members WHERE \"nama_lengkap\" ILIKE '%john%' OR \"username\" ILIKE '%john%'");
    console.log("Members:", members.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
