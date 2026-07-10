import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-to-admin.ts <user-email>");
    process.exit(1);
  }

  try {
    const result = await db.update(users)
      .set({ role: "admin" })
      .where(eq(users.email, email))
      .returning();

    if (result.length > 0) {
      console.log(`Successfully promoted ${email} to admin!`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
  } catch (error) {
    console.error("Error updating user:", error);
  }
  
  process.exit(0);
}

main();
