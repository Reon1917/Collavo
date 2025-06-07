"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileIcon, Plus, Upload, Loader2, RefreshCw } from 'lucide-react';
import { ContentLoading } from '@/components/ui/content-loading';
import { FileUploadModal } from './FileUploadModal';
import { FileEditModal } from './FileEditModal';
import { FileDeleteModal } from './FileDeleteModal';
import { AddLinkModal } from './AddLinkModal';
import { LinkEditModal } from './LinkEditModal';
import { FileCard } from './FileCard';
import { LinkCard } from './LinkCard';
import type { FilesViewProps } from './types';

interface ProjectFile {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  size?: number | null;
  mimeType?: string | null;
  uploadThingId?: string | null;
  addedAt: string;
  addedByName: string;
  addedByEmail: string;
}

interface ProjectLink {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  addedAt: string;
  addedByName: string;
  addedByEmail: string;
}

export function FilesView({ projectId }: FilesViewProps) {
  const [allItems, setAllItems] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkEditModalOpen, setIsLinkEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [selectedLink, setSelectedLink] = useState<ProjectLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Separate files and links
  const files = allItems.filter(item => item.uploadThingId !== null);
  const links = allItems.filter(item => item.uploadThingId === null);

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
      setAllItems(data.files || []);
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
    setAllItems(prevItems => [newFile, ...prevItems]);
  };

  const handleLinkAdded = (newLink: ProjectLink) => {
    setAllItems(prevItems => [newLink as ProjectFile, ...prevItems]);
  };

  const handleFileUpdated = (updatedFile: ProjectFile) => {
    setAllItems(prevItems => prevItems.map(item => 
      item.id === updatedFile.id ? updatedFile : item
    ));
  };

  const handleLinkUpdated = (updatedLink: ProjectLink) => {
    setAllItems(prevItems => prevItems.map(item => 
      item.id === updatedLink.id ? { ...item, ...updatedLink } : item
    ));
  };

  const handleFileDeleted = (fileId: string) => {
    setAllItems(prevItems => prevItems.filter(item => item.id !== fileId));
  };

  const handleEditFile = (file: ProjectFile) => {
    setSelectedFile(file);
    setIsEditModalOpen(true);
  };

  const handleEditLink = (link: ProjectLink) => {
    setSelectedLink(link);
    setIsLinkEditModalOpen(true);
  };

  const handleDeleteFile = (file: ProjectFile) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteLink = (link: ProjectLink) => {
    setSelectedLink(link);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = () => {
    fetchFiles();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Files & Resources</h1>
            <p className="text-muted-foreground">
              Manage project files and external links
            </p>
          </div>
          <div className="flex gap-2">
            <Button disabled variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button disabled variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button disabled variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </div>
        <ContentLoading 
          size="md" 
          message="Loading files..." 
          className="py-12"
        />
      </div>
    );
  }

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
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsAddLinkModalOpen(true)}
          >
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

        {files.length === 0 && links.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No files or links yet</h3>
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
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setIsAddLinkModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Link
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Responsive Layout: Two columns on large screens, single column on small */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Files Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Files ({files.length})
                </h2>
              </div>
              
              {files.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      No files uploaded yet
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      <Upload className="h-4 w-4" />
                      Upload File
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <FileCard 
                      key={file.id} 
                      file={file}
                      onClick={() => window.open(file.url, '_blank', 'noopener,noreferrer')}
                      onEdit={handleEditFile}
                      onDelete={handleDeleteFile}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Links Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Links ({links.length})
                </h2>
              </div>
              
              {links.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Plus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      No links added yet
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setIsAddLinkModalOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Link
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => (
                    <LinkCard 
                      key={link.id} 
                      link={link}
                      onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                      onEdit={handleEditLink}
                      onDelete={handleDeleteLink}
                    />
                  ))}
                </div>
              )}
            </div>
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

      {/* Add Link Modal */}
      <AddLinkModal
        isOpen={isAddLinkModalOpen}
        onOpenChange={setIsAddLinkModalOpen}
        projectId={projectId}
        onLinkAdded={handleLinkAdded}
      />

      {/* Edit File Modal */}
      <FileEditModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        file={selectedFile}
        projectId={projectId}
        onFileUpdated={handleFileUpdated}
      />

      {/* Edit Link Modal */}
      <LinkEditModal
        isOpen={isLinkEditModalOpen}
        onOpenChange={setIsLinkEditModalOpen}
        link={selectedLink}
        projectId={projectId}
        onLinkUpdated={handleLinkUpdated}
      />

      {/* Delete Modal (works for both files and links) */}
      <FileDeleteModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        file={selectedFile || selectedLink}
        projectId={projectId}
        onFileDeleted={handleFileDeleted}
      />

    </div>
  );
} 