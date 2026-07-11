import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/client-api';
import { db } from '@/db';
import { users, members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const authHeader = headerList.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    const token = authHeader.substring(7);
    const supabase = createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.id, user.id));
    if (userRecord?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin only' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const [adminMember] = await db.select().from(members).where(eq(members.userId, user.id));
    if (!adminMember || !adminMember.cooperativeId) {
      return NextResponse.json({ success: false, error: 'Admin has no cooperative' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const body = await request.json();
    const { memberId, data } = body;
    if (!memberId || !data) {
      return NextResponse.json({ success: false, error: 'Missing memberId or data' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const [targetMember] = await db.select().from(members).where(eq(members.id, memberId));
    if (!targetMember || targetMember.cooperativeId !== adminMember.cooperativeId) {
      return NextResponse.json({ success: false, error: 'Member not found or unauthorized' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    await db.update(members).set({ 
      namaLengkap: data.namaLengkap !== undefined ? data.namaLengkap : targetMember.namaLengkap,
      nomorHp: data.nomorHp !== undefined ? data.nomorHp : targetMember.nomorHp,
      statusAnggota: data.statusAnggota !== undefined ? data.statusAnggota : targetMember.statusAnggota,
    }).where(eq(members.id, memberId));

    return NextResponse.json({ success: true }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    console.error("Admin Member API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
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
