import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { files, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hasPermission } from '@/lib/auth-helpers';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

// PATCH /api/projects/[id]/files/[fileId] - Update file metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
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

    const { id: projectId, fileId } = await params;
    
    // Check if user has permission to handle files
    const hasHandleFilesPermission = await hasPermission(session.user.id, projectId, 'handleFile');
    if (!hasHandleFilesPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit files' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, url } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      description: description?.trim() || null,
    };

    // If URL is provided, update it (for links)
    if (url !== undefined) {
      updateData.url = url;
    }

    // Update the file in the database
    const updatedFiles = await db
      .update(files)
      .set(updateData)
      .where(and(
        eq(files.id, fileId),
        eq(files.projectId, projectId)
      ))
      .returning();

    if (!updatedFiles[0]) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Get the updated file with user information
    const fileWithUser = await db
      .select({
        id: files.id,
        projectId: files.projectId,
        name: files.name,
        description: files.description,
        url: files.url,
        uploadThingId: files.uploadThingId,
        size: files.size,
        mimeType: files.mimeType,
        addedAt: files.addedAt,
        addedBy: files.addedBy,
        addedByName: user.name,
        addedByEmail: user.email,
      })
      .from(files)
      .innerJoin(user, eq(user.id, files.addedBy))
      .where(eq(files.id, fileId))
      .limit(1);

    return NextResponse.json(fileWithUser[0], { status: 200 });

  } catch (error) {
    // Log error for debugging (server-side only)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/files/[fileId] - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
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

    const { id: projectId, fileId } = await params;
    
    // Check if user has permission to handle files
    const hasHandleFilesPermission = await hasPermission(session.user.id, projectId, 'handleFile');
    if (!hasHandleFilesPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete files' },
        { status: 403 }
      );
    }

    // Get the file to delete (to get UploadThing ID)
    const fileToDelete = await db
      .select({
        id: files.id,
        uploadThingId: files.uploadThingId,
      })
      .from(files)
      .where(and(
        eq(files.id, fileId),
        eq(files.projectId, projectId)
      ))
      .limit(1);

    if (!fileToDelete[0]) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete from UploadThing first
    try {
      if (fileToDelete[0].uploadThingId) {
        await utapi.deleteFiles([fileToDelete[0].uploadThingId]);
      }
    } catch (uploadThingError) {
      // Error deleting from UploadThing, continue with database deletion
      // Continue with database deletion even if UploadThing fails
    }

    // Delete from database
    const deletedFiles = await db
      .delete(files)
      .where(and(
        eq(files.id, fileId),
        eq(files.projectId, projectId)
      ))
      .returning();

    if (!deletedFiles[0]) {
      return NextResponse.json(
        { error: 'Failed to delete file from database' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'File deleted successfully', fileId },
      { status: 200 }
    );

  } catch (error) {
    // Log error for debugging (server-side only)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 