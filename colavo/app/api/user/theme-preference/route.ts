import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { colorPreferences } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ALLOWED_COLOR_THEMES } from '@/lib/themes/definitions';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's theme preference
    const userPreference = await db
      .select({ theme: colorPreferences.theme })
      .from(colorPreferences)
      .where(eq(colorPreferences.userId, session.user.id))
      .limit(1);

    // Return default theme if no preference found
    const theme = userPreference.length > 0 ? userPreference[0]!.theme : 'default';

    return NextResponse.json({ theme });
  } catch {
    // console.error('Error fetching user theme preference:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { theme } = body;

    // Validate theme value
    const validThemes = ALLOWED_COLOR_THEMES;
    if (!validThemes.includes(theme)) {
      return NextResponse.json({ 
        error: 'Invalid theme value' 
      }, { status: 400 });
    }

    // Check if preference already exists
    const existingPreference = await db
      .select()
      .from(colorPreferences)
      .where(eq(colorPreferences.userId, session.user.id))
      .limit(1);

    if (existingPreference.length > 0) {
      // Update existing preference
      await db
        .update(colorPreferences)
        .set({ 
          theme,
          updatedAt: new Date()
        })
        .where(eq(colorPreferences.userId, session.user.id));
    } else {
      // Create new preference
      await db
        .insert(colorPreferences)
        .values({
          userId: session.user.id,
          theme,
        });
    }

    return NextResponse.json({ 
      success: true, 
      theme 
    });
  } catch {
    // console.error('Error updating user theme preference:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete user's theme preference (will revert to default)
    await db
      .delete(colorPreferences)
      .where(eq(colorPreferences.userId, session.user.id));

    return NextResponse.json({ 
      success: true,
      theme: 'default'
    });
  } catch {
    // console.error('Error deleting user theme preference:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}