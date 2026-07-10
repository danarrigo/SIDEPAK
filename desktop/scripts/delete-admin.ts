import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, members, memberProgress } from "../src/db/schema";
import { eq, inArray } from "drizzle-orm";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  console.log("Looking for admin users...");
  const adminUsers = await db.select().from(users).where(eq(users.role, "admin"));
  const adminIds = adminUsers.map((u) => u.id);

  if (adminIds.length === 0) {
    console.log("No admins found.");
    process.exit(0);
  }

  console.log(`Found ${adminIds.length} admins. Deleting...`);
  
  const adminMembers = await db.select().from(members).where(inArray(members.userId, adminIds));
  const memberIds = adminMembers.map((m) => m.id);

  if (memberIds.length > 0) {
     await db.delete(memberProgress).where(inArray(memberProgress.memberId, memberIds));
     await db.delete(members).where(inArray(members.id, memberIds));
  }

  await db.delete(users).where(inArray(users.id, adminIds));
  
  console.log("Successfully deleted admins.");
  process.exit(0);
}

main().catch(console.error);
