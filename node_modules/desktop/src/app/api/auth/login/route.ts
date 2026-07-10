import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/client-api';
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const user = data.user;
    const [member] = await db.select().from(members).where(eq(members.userId, user.id));

    return NextResponse.json({
      success: true,
      token: data.session?.access_token,
      memberId: member?.id || 1,
      email: user.email,
      fullName: member?.namaLengkap || 'Anggota Koperasi'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error("API Login Error:", error);
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
