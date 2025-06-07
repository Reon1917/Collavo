"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileIcon, Plus, Upload, Loader2, RefreshCw } from 'lucide-react';
import { FileUploadModal } from './FileUploadModal';
import { FileCard } from './FileCard';
import type { FilesViewProps } from './types';

interface ProjectFile {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  size?: number | null;
  mimeType?: string | null;
  addedAt: string;
  addedByName: string;
  addedByEmail: string;
}

export function FilesView({ projectId }: FilesViewProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/projects/${projectId}/files`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchFiles();
    }
  }, [projectId]);

  const handleFileUploaded = (newFile: ProjectFile) => {
    setFiles(prevFiles => [newFile, ...prevFiles]);
  };

  const handleRefresh = () => {
    fetchFiles();
  };

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Files & Resources</h1>
          <p className="text-gray-600">Manage project files and external links</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsUploadModalOpen(true)}
          >
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
        {error && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading files...</p>
            </CardContent>
          </Card>
        ) : files.length === 0 ? (
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
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setIsUploadModalOpen(true)}
                >
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
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <FileCard 
                key={file.id} 
                file={file}
                onClick={() => window.open(file.url, '_blank', 'noopener,noreferrer')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        projectId={projectId}
        onFileUploaded={handleFileUploaded}
      />

    </div>
  );
} 