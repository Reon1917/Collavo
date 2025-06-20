import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { 
  user, 
  session as sessionTable, 
  projects, 
  members, 
  permissions, 
  mainTasks, 
  subTasks, 
  events, 
  files,
  verification
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

// DELETE /api/auth/delete-account - Delete user account and all related data
export async function DELETE(request: NextRequest) {
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

    const userId = session.user.id;

    // Get all projects led by this user to delete them first
    const ledProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.leaderId, userId));

    // Get all files uploaded by this user to delete from UploadThing
    const userFiles = await db
      .select({ uploadThingId: files.uploadThingId })
      .from(files)
      .where(eq(files.addedBy, userId));

    // Delete uploaded files from UploadThing first
    const uploadThingIds = userFiles
      .map(f => f.uploadThingId)
      .filter(Boolean) as string[];

    if (uploadThingIds.length > 0) {
      try {
        await utapi.deleteFiles(uploadThingIds);
      } catch (error) {
        // Log error but continue with database deletion
        console.error('Failed to delete some files from UploadThing:', error);
      }
    }

    // Start cascade deletion in the correct order
    // 1. Delete projects led by the user (this will cascade delete most related data)
    for (const project of ledProjects) {
      // Get member IDs for this project to delete permissions
      const projectMembers = await db
        .select({ id: members.id })
        .from(members)
        .where(eq(members.projectId, project.id));

      // Delete permissions for all members in this project
      for (const member of projectMembers) {
        await db.delete(permissions)
          .where(eq(permissions.memberId, member.id));
      }

      // Get main task IDs for this project to delete subtasks
      const projectTasks = await db
        .select({ id: mainTasks.id })
        .from(mainTasks)
        .where(eq(mainTasks.projectId, project.id));

      // Delete subtasks for all main tasks in this project
      for (const task of projectTasks) {
        await db.delete(subTasks)
          .where(eq(subTasks.mainTaskId, task.id));
      }

      // Delete all main tasks in the project
      await db.delete(mainTasks)
        .where(eq(mainTasks.projectId, project.id));

      // Delete all files in the project
      await db.delete(files)
        .where(eq(files.projectId, project.id));

      // Delete all events in the project
      await db.delete(events)
        .where(eq(events.projectId, project.id));

      // Delete all members in the project
      await db.delete(members)
        .where(eq(members.projectId, project.id));

      // Finally delete the project
      await db.delete(projects)
        .where(eq(projects.id, project.id));
    }

    // 2. Delete remaining subtasks assigned to or created by the user in other projects
    await db.delete(subTasks)
      .where(eq(subTasks.assignedId, userId));

    await db.delete(subTasks)
      .where(eq(subTasks.createdBy, userId));

    // 3. Delete remaining main tasks created by the user in other projects
    await db.delete(mainTasks)
      .where(eq(mainTasks.createdBy, userId));

    // 4. Delete remaining events created by the user in other projects
    await db.delete(events)
      .where(eq(events.createdBy, userId));

    // 5. Delete remaining files added by the user in other projects
    await db.delete(files)
      .where(eq(files.addedBy, userId));

    // 6. Delete remaining member records and their permissions
    const remainingMemberRecords = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.userId, userId));

    for (const memberRecord of remainingMemberRecords) {
      await db.delete(permissions)
        .where(eq(permissions.memberId, memberRecord.id));
    }

    await db.delete(members)
      .where(eq(members.userId, userId));

    // 7. Delete user sessions
    await db.delete(sessionTable)
      .where(eq(sessionTable.userId, userId));

    // 8. Delete user verification records
    await db.delete(verification)
      .where(eq(verification.identifier, session.user.email));

    // 9. Finally delete the user account
    await db.delete(user)
      .where(eq(user.id, userId));

    return NextResponse.json({ 
      message: 'Account and all associated data deleted successfully' 
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error during account deletion' },
      { status: 500 }
    );
  }
} 