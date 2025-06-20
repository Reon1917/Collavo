import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { files, user } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, desc } from 'drizzle-orm';
import { requireProjectAccess, hasPermission, checkPermissionDetailed, createPermissionErrorResponse } from '@/lib/auth-helpers';

// GET /api/projects/[id]/files - List project files
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
    
    // Check if user has access to project and can view files
    await requireProjectAccess(session.user.id, projectId);
    
    const hasViewFilesPermission = await hasPermission(session.user.id, projectId, 'viewFiles');
    if (!hasViewFilesPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view files' },
        { status: 403 }
      );
    }

    // Get all files for the project with user information
    const projectFiles = await db
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
      .where(eq(files.projectId, projectId))
      .orderBy(desc(files.addedAt));

    return NextResponse.json({
      files: projectFiles,
      total: projectFiles.length
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }
    
    // Log error for debugging (server-side only)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/files - Add new file
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
    
    // Check if user has access to project and can handle files
    await requireProjectAccess(session.user.id, projectId);
    
    const permissionCheck = await checkPermissionDetailed(session.user.id, projectId, 'handleFile');
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.errorType === 'INVALID_PROJECT' ? 404 : 403;
      return NextResponse.json(
        createPermissionErrorResponse(permissionCheck),
        { status: statusCode }
      );
    }

    const body = await request.json();
    const { name, description, url, uploadThingId, size, mimeType } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      );
    }

    if (name.length > 500) {
      return NextResponse.json(
        { error: 'File name must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Create file record
    const newFile = await db.insert(files).values({
      id: createId(),
      projectId: projectId,
      addedBy: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
      url: url,
      uploadThingId: uploadThingId || null,
      size: size || null,
      mimeType: mimeType || null,
      addedAt: new Date(),
    }).returning();

    if (!newFile || newFile.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create file record' },
        { status: 500 }
      );
    }

    // Get the created file with user information
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
      .where(eq(files.id, newFile[0]!.id))
      .limit(1);

    if (!fileWithUser[0]) {
      return NextResponse.json(
        { error: 'Failed to retrieve created file' },
        { status: 500 }
      );
    }

    return NextResponse.json(fileWithUser[0], { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }
    
    // Log error for debugging (server-side only)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 