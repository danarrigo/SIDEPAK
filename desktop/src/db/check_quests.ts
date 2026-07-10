import fs from 'fs';
import path from 'path';
import pg from 'pg';

async function main() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)/);
      if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    });
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const result = await pool.query('SELECT id, title, action_type, target_count, frequency FROM quests ORDER BY id');
  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
}

main().catch(console.error);
