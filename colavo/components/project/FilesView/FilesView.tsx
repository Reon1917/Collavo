import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileIcon, Plus, Upload } from 'lucide-react';
import type { FilesViewProps } from './types';

export function FilesView({ }: FilesViewProps) {
  // TODO: Replace with actual API call to fetch project files
  // const files = await fetch(`/api/projects/${projectId}/files`).then(res => res.json());
  
  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Files & Resources</h1>
          <p className="text-gray-600">Manage project files and external links</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
      </header>

      {/* Files and Resources List */}
      <section>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No files yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Upload files or add links to Google Docs, Canva presentations, and other project resources.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* TODO: Implement file management components */}
      {/* 
      Future features:
      - File upload with drag & drop
      - File preview and download
      - External link management
      - File sharing and permissions
      - File versioning
      */}
    </div>
  );
} 