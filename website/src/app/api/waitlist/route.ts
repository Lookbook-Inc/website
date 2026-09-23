import { NextRequest, NextResponse } from 'next/server';
import { createWaitlistClient } from '@/lib/supabase/waitlist-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const source = body.source || 'website';
    const name = body.name?.trim() || null;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = createWaitlistClient();
    const { error } = await supabase
      .from('waitlist')
      .insert({ email, source, name });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: "You're already on the waitlist!" },
          { status: 409 }
        );
      }

      console.error('Waitlist signup error:', error);
      return NextResponse.json(
        { error: 'Failed to process waitlist signup' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully joined waitlist' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
