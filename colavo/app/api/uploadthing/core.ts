import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/auth-helpers';

const f = createUploadthing();

// Proper authentication function
const authenticateUser = async (req: Request) => {
  try {
    // Get session using better-auth
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user) {
      throw new UploadThingError("Authentication required. Please log in.");
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email
    };
  } catch (error) {
    // Authentication failed
    throw new UploadThingError("Authentication failed. Please log in.");
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Document uploader for PDF, DOCX, XLSX, and PPTX files
  documentUploader: f({
    "application/pdf": {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "4MB", 
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Authentication and authorization middleware
    .middleware(async ({ req }) => {
      // Authenticate user first
      const user = await authenticateUser(req);

      // Extract projectId from the request
      // UploadThing doesn't give us access to URL params directly,
      // so we need to get it from the referer or custom headers
      const referer = req.headers.get('referer') || '';
      const projectIdMatch = referer.match(/\/project\/([^/?]+)/);
      
      if (!projectIdMatch) {
        throw new UploadThingError("Invalid request. Project context required.");
      }

      const projectId = projectIdMatch[1];
      
      if (!projectId) {
        throw new UploadThingError("Project ID is required for file uploads.");
      }

      // Check if user has permission to upload files to this project
      try {
        const hasUploadPermission = await hasPermission(user.id, projectId, 'handleFile');
        
        if (!hasUploadPermission) {
          throw new UploadThingError("Insufficient permissions to upload files to this project.");
        }
      } catch (error) {
        // Permission check failed
        throw new UploadThingError("Unable to verify permissions. Access denied.");
      }

      // Return metadata for onUploadComplete
      return { 
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        projectId: projectId
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      // File upload completed successfully

      // Return metadata that will be sent to the client
      return { 
        uploadedBy: metadata.userId,
        fileUrl: file.url, 
        fileKey: file.key,
        projectId: metadata.projectId
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
