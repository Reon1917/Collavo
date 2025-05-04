import { getProjectById, getResourcesByProjectId, getUserById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Resource } from '@/types';

export default async function FilesPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const project = await getProjectById(id);
  const resources = await getResourcesByProjectId(id);

  if (!project) {
    return null; // This will be handled by the layout
  }

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Files & Links</h1>
          <p className="text-gray-600">{resources.length} resources</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Add Resource
        </Button>
      </header>

      {/* Resources List */}
      <section>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {resources.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {resources.map(resource => (
                <ResourceItem key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileIcon size={24} />
              </div>
              <h3 className="text-lg font-medium mb-2">No resources yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Add links to your Google Docs, Canva presentations, or other project-related resources.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Add Your First Resource
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

async function ResourceItem({ resource }: { resource: Resource }) {
  // In a real app, we would use a more efficient way to fetch users
  const creator = await getUserById(resource.createdBy);
  
  // Determine icon based on resource type or URL
  const getResourceIcon = (resource: Resource) => {
    if (resource.url.includes('docs.google.com')) {
      if (resource.url.includes('/document/')) {
        return <GoogleDocsIcon />;
      } else if (resource.url.includes('/spreadsheets/')) {
        return <GoogleSheetsIcon />;
      } else if (resource.url.includes('/presentation/')) {
        return <GoogleSlidesIcon />;
      }
    } else if (resource.url.includes('canva.com')) {
      return <CanvaIcon />;
    }
    
    return <FileIcon />;
  };

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
          {getResourceIcon(resource)}
        </div>
        <div className="flex-1 min-w-0">
          <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-gray-900 hover:text-blue-600 block truncate"
          >
            {resource.name}
          </a>
          <div className="flex items-center text-sm text-gray-500">
            <span>Added {new Date(resource.createdAt).toLocaleDateString()}</span>
            {creator && (
              <>
                <span className="mx-2 text-gray-300">u2022</span>
                <span>By {creator.name}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <CopyIcon size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <MoreIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Icon components
function FileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function GoogleDocsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#4285F4" />
      <path d="M7 7H17V9H7V7Z" fill="white" />
      <path d="M7 11H17V13H7V11Z" fill="white" />
      <path d="M7 15H13V17H7V15Z" fill="white" />
    </svg>
  );
}

function GoogleSheetsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#0F9D58" />
      <path d="M7 7H11V11H7V7Z" fill="white" />
      <path d="M13 7H17V11H13V7Z" fill="white" />
      <path d="M7 13H11V17H7V13Z" fill="white" />
      <path d="M13 13H17V17H13V13Z" fill="white" />
    </svg>
  );
}

function GoogleSlidesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#F4B400" />
      <rect x="7" y="7" width="10" height="10" rx="1" fill="white" />
    </svg>
  );
}

function CanvaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3V21H21V3H3Z" fill="#00C4CC" />
      <path d="M12 7L16 12L12 17L8 12L12 7Z" fill="white" />
    </svg>
  );
}

function CopyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function MoreIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  );
}
