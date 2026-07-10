import { db } from "../db";
import { pointTransactions } from "../db/schema/gamification";

async function main() {
  const pts = await db.select().from(pointTransactions);
  console.log("Point Transactions:", pts);
}

main().catch(console.error);
