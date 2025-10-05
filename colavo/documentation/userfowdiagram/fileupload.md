# File Upload Flow

This diagram reflects the current end-to-end upload experience implemented in `components/project/FilesView/FileUploadModal.tsx`, `app/api/uploadthing/core.ts`, and the routes under `app/api/projects/[id]/files`. It highlights the authentication and permission checks that gate uploads before a record is persisted.

```mermaid
sequenceDiagram
    participant U as Project Member
    participant UI as FileUploadModal (client)
    participant UT as UploadThing Middleware
    participant AUTH as auth.api.getSession
    participant PERM as hasPermission/checkPermissionDetailed
    participant ST as UploadThing Storage
    participant API as POST /api/projects/:id/files
    participant DB as Drizzle (files table)

    U->>UI: Select file & submit form
    UI->>UT: startUpload('documentUploader', file)
    UT->>AUTH: Validate session headers
    AUTH-->>UT: Session (user id/email) or throws UploadThingError
    UT->>UT: Parse projectId from referer header
    UT->>PERM: hasPermission(userId, projectId, 'handleFile')
    PERM-->>UT: allow or UploadThingError
    UT->>ST: Stream file to UploadThing storage
    ST-->>UT: { url, key }
    UT-->>UI: onClientUploadComplete(metadata, url, key)
    UI->>API: POST metadata + url/key/name/size
    API->>AUTH: getSession(headers)
    AUTH-->>API: Session
    API->>PERM: checkPermissionDetailed(userId, projectId, 'handleFile')
    PERM-->>API: allow or error (403/404)
    API->>DB: Insert file record with createId()
    DB-->>API: Saved file + addedBy info
    API-->>UI: 200 OK { file }
    UI-->>U: Toast success & refresh list

    alt Permission denied
        UT-->>UI: UploadThingError('Permission denied')
        UI-->>U: Show error toast & close modal
    else API validation error
        API-->>UI: 400/500 JSON { error }
        UI-->>U: Display inline error message
    end
```
