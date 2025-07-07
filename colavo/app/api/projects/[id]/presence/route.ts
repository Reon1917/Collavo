import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/auth-helpers';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

// Types
interface UserPresence {
  id: string;
  userId: string;
  projectId: string;
  lastSeen: Date;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
}

// GET /api/projects/[id]/presence - Get online users for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    
    // Check if user has access to this project
    const projectAccess = await checkProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Get online users (last seen within 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const { data: presenceData, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_online', true)
      .gte('last_seen', twoMinutesAgo.toISOString());

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch presence data' },
        { status: 500 }
      );
    }

    // Get user details for online users
    const userIds = presenceData?.map(p => p.user_id) || [];
    const users = userIds.length > 0 ? await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image
      })
      .from(user)
      .where(inArray(user.id, userIds)) : [];

    // Create user map for efficient lookup
    const userMap = new Map(users.map(u => [u.id, u]));

    // Transform presence data
    const transformedPresence: UserPresence[] = presenceData?.map(presence => {
      const userData = userMap.get(presence.user_id);
      return {
        id: presence.id,
        userId: presence.user_id,
        projectId: presence.project_id,
        lastSeen: new Date(presence.last_seen),
        isOnline: presence.is_online,
        createdAt: new Date(presence.created_at),
        updatedAt: new Date(presence.updated_at),
        ...(userData && { user: userData })
      };
    }) || [];

    return NextResponse.json({
      onlineMembers: transformedPresence,
      count: transformedPresence.length
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/presence - Update user presence
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    
    // Check if user has access to this project
    const projectAccess = await checkProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isOnline = true } = body;

    const supabase = createServerSupabaseClient();
    
    // Upsert user presence
    const { data: presence, error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: session.user.id,
        project_id: projectId,
        is_online: isOnline,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id,project_id'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update presence' },
        { status: 500 }
      );
    }

    // Get user details for response
    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    // Transform response
    const transformedPresence: UserPresence = {
      id: presence.id,
      userId: presence.user_id,
      projectId: presence.project_id,
      lastSeen: new Date(presence.last_seen),
      isOnline: presence.is_online,
      createdAt: new Date(presence.created_at),
      updatedAt: new Date(presence.updated_at),
      ...(userData[0] && { user: userData[0] })
    };

    return NextResponse.json(transformedPresence);

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/presence - Set user offline
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    
    // Check if user has access to this project
    const projectAccess = await checkProjectAccess(projectId, session.user.id);
    if (!projectAccess.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Set user offline
    const { error } = await supabase
      .from('user_presence')
      .update({
        is_online: false,
        last_seen: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .eq('project_id', projectId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update presence' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 