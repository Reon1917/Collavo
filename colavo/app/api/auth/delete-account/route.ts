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
import { eq } from 'drizzle-orm';
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
        // eslint-disable-next-line no-console
        console.error('Failed to delete some files from UploadThing:', error);
      }
    }

    // Delete data in order (rely on cascading foreign keys where possible)
    // Note: Without transactions in Neon HTTP, we rely on database constraints for consistency
    
    // 1. Delete projects led by the user (cascades will handle related data)
    for (const project of ledProjects) {
      await db.delete(projects).where(eq(projects.id, project.id));
    }

    // 2. Clean up remaining user-specific data in other projects
    await db.delete(subTasks).where(eq(subTasks.assignedId, userId));
    await db.delete(subTasks).where(eq(subTasks.createdBy, userId));
    await db.delete(mainTasks).where(eq(mainTasks.createdBy, userId));
    await db.delete(events).where(eq(events.createdBy, userId));
    await db.delete(files).where(eq(files.addedBy, userId));

    // 3. Delete remaining member records (permissions should cascade)
    await db.delete(members).where(eq(members.userId, userId));

    // 4. Delete user sessions and verification records
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
    await db.delete(verification).where(eq(verification.identifier, session.user.email));

    // 5. Finally delete the user account
    await db.delete(user).where(eq(user.id, userId));

    return NextResponse.json({ 
      message: 'Account and all associated data deleted successfully' 
    });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error during account deletion' },
      { status: 500 }
    );
  }
} 