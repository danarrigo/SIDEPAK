"use server";

import { db } from "@/db";
import { cooperatives } from "@/db/schema";

export async function getAllCooperatives() {
  try {
    return await db.select().from(cooperatives);
  } catch (error) {
    console.error("Failed to fetch cooperatives:", error);
    return [];
  }
}
