import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, members, memberProgress } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    // find admins
    const adminUsers = await db.select().from(users).where(eq(users.role, "admin"));
    const adminIds = adminUsers.map((u) => u.id);

    if (adminIds.length === 0) {
      return NextResponse.json({ message: "No admins found." });
    }

    // delete from members and memberProgress first, though users delete might cascade
    const adminMembers = await db.select().from(members).where(inArray(members.userId, adminIds));
    const memberIds = adminMembers.map((m) => m.id);

    if (memberIds.length > 0) {
       await db.delete(memberProgress).where(inArray(memberProgress.memberId, memberIds));
       await db.delete(members).where(inArray(members.id, memberIds));
    }

    await db.delete(users).where(inArray(users.id, adminIds));

    return NextResponse.json({ message: "Deleted admins successfully", count: adminIds.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
