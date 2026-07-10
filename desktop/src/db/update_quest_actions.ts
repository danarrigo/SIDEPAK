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

  // Map quest titles to action_types we can actually implement
  const updates = [
    { id: 31, action_type: 'daily_login' },      // Absen Harian -> login harian
    { id: 32, action_type: 'check_leaderboard' }, // Cek Klasemen -> cek leaderboard
    { id: 33, action_type: 'saving' },             // Nabung Yuk! -> simpanan
    { id: 34, action_type: 'visit_shop' },         // Kunjungan Toko -> beli di toko
    { id: 35, action_type: 'join_event' },         // Membantu Sesama -> ikut event
    { id: 36, action_type: 'play_arena' },         // Ksatria Arena -> main arena
    { id: 37, action_type: 'visit_shop' },         // Berburu Diskon -> beli di toko (2x)
    { id: 38, action_type: 'pay_loan' },            // Ayo Panen -> bayar cicilan
    { id: 39, action_type: 'vote_governance' },    // Suara Anggota -> voting
    { id: 40, action_type: 'check_leaderboard' }, // Pemantau Harga -> cek leaderboard
    { id: 41, action_type: 'check_balance' },      // Dompet Sehat -> cek saldo
    { id: 42, action_type: 'join_event' },         // Peduli Koperasi -> ikut event
    { id: 43, action_type: 'daily_login' },        // Login Berturut -> login 3x/minggu
    { id: 44, action_type: 'play_arena' },         // Duel Master -> main arena
    { id: 45, action_type: 'join_event' },         // Bintang Desa -> ikut event
    { id: 46, action_type: 'saving' },             // Raja Nabung -> nabung 3x/minggu
    { id: 47, action_type: 'visit_shop' },         // Pecinta Belanja -> beli 2x/minggu
    { id: 48, action_type: 'daily_login' },        // Pengepul XP -> target 1000 XP
    { id: 49, action_type: 'play_arena' },         // Gladiator Tangguh -> main arena 5x
    { id: 50, action_type: 'play_arena' },         // Dewa Prank -> main arena 3x
    { id: 51, action_type: 'join_event' },         // Aktivis Koperasi -> ikut event
    { id: 52, action_type: 'saving' },             // Kolektor Poin -> nabung
  ];

  for (const u of updates) {
    await pool.query('UPDATE quests SET action_type = $1 WHERE id = $2', [u.action_type, u.id]);
    console.log(`Updated quest ${u.id} -> action_type: ${u.action_type}`);
  }

  console.log('\nDone! All quests now have action_types.');
  await pool.end();
}

main().catch(console.error);
