import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/client-api';
import { db } from '@/db';
import { users, members, cooperatives } from '@/db/schema';
import { memberProgress } from '@/db/schema/gamification';
import { and, ilike } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, nik, namaLengkap, provinsi, kabupaten, kecamatan, desa, koperasi } = data;

    // Check/create cooperative
    let [coop] = await db.select().from(cooperatives).where(
      and(
        ilike(cooperatives.name, koperasi),
        ilike(cooperatives.desa, desa)
      )
    );

    if (!coop) {
      const [newCoop] = await db.insert(cooperatives).values({
        name: koperasi,
        provinsi,
        kabupaten,
        kecamatan,
        desa,
      }).returning();
      coop = newCoop;
    }

    const supabase = createSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (authData.user) {
      // Insert profiles
      await db.insert(users).values({
        id: authData.user.id,
        email,
        role: "member",
        isActive: true,
      });

      const [member] = await db.insert(members).values({
        userId: authData.user.id,
        nik,
        namaLengkap,
        provinsi,
        kabupaten,
        kecamatan,
        desa,
        koperasi: coop.name,
      }).returning();

      await db.insert(memberProgress).values({
        memberId: member.id,
        level: 1,
        xp: 0,
        pointsBalance: 0,
        currentStreak: 0,
        longestStreak: 0
      });
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error("API Signup Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
