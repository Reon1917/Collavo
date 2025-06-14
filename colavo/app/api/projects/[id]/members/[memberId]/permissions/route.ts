import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { members, permissions, projects } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';

// Available permission types based on the schema
const PERMISSION_TYPES = [
  'addMember',
  'createTask', 
  'handleTask',
  'updateTask',
  'createEvent',
  'handleEvent',
  'handleFile',
  'viewFiles'
] as const;

type PermissionType = typeof PERMISSION_TYPES[number];

// PUT /api/projects/[id]/members/[memberId]/permissions - Update member permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
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

    const { id: projectId, memberId } = await params;
    
    // Check if current user is the project leader
    const project = await db
      .select({ leaderId: projects.leaderId })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project.length || project[0]?.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only project leaders can modify member permissions' },
        { status: 403 }
      );
    }

    // Verify the member exists and belongs to this project
    const member = await db
      .select({ id: members.id, userId: members.userId, role: members.role })
      .from(members)
      .where(and(
        eq(members.id, memberId),
        eq(members.projectId, projectId)
      ))
      .limit(1);

    if (!member.length) {
      return NextResponse.json(
        { error: 'Member not found in this project' },
        { status: 404 }
      );
    }

    const memberData = member[0];
    if (!memberData) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent modifying leader permissions
    if (memberData.role === 'leader') {
      return NextResponse.json(
        { error: 'Cannot modify leader permissions' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { permissions: newPermissions } = body;

    // Validate permissions format
    if (!newPermissions || typeof newPermissions !== 'object') {
      return NextResponse.json(
        { error: 'Invalid permissions format' },
        { status: 400 }
      );
    }

    // Validate permission types
    const validPermissionUpdates: { permission: PermissionType; granted: boolean }[] = [];
    
    for (const [permissionKey, granted] of Object.entries(newPermissions)) {
      if (!PERMISSION_TYPES.includes(permissionKey as PermissionType)) {
        return NextResponse.json(
          { error: `Invalid permission type: ${permissionKey}` },
          { status: 400 }
        );
      }
      
      if (typeof granted !== 'boolean') {
        return NextResponse.json(
          { error: `Permission value must be boolean for ${permissionKey}` },
          { status: 400 }
        );
      }

      validPermissionUpdates.push({
        permission: permissionKey as PermissionType,
        granted
      });
    }

    // Get existing permissions for this member
    const existingPermissions = await db
      .select({
        id: permissions.id,
        permission: permissions.permission,
        granted: permissions.granted
      })
      .from(permissions)
      .where(eq(permissions.memberId, memberId));

    // Process each permission update
    for (const update of validPermissionUpdates) {
      const existingPermission = existingPermissions.find(
        p => p.permission === update.permission
      );

      if (existingPermission) {
        // Update existing permission
        await db
          .update(permissions)
          .set({
            granted: update.granted,
            grantedAt: new Date(),
            grantedBy: session.user.id
          })
          .where(eq(permissions.id, existingPermission.id));
      } else {
        // Create new permission record
        await db.insert(permissions).values({
          id: createId(),
          memberId: memberId,
          permission: update.permission,
          granted: update.granted,
          grantedAt: new Date(),
          grantedBy: session.user.id
        });
      }
    }

    // Return updated permissions
    const updatedPermissions = await db
      .select({
        permission: permissions.permission,
        granted: permissions.granted
      })
      .from(permissions)
      .where(eq(permissions.memberId, memberId));

    const grantedPermissions = updatedPermissions
      .filter(p => p.granted)
      .map(p => p.permission);

    return NextResponse.json({
      message: 'Permissions updated successfully',
      memberId,
      permissions: grantedPermissions
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 