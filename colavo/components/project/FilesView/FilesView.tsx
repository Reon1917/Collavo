"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FolderIcon, Plus, Link, FileText, ExternalLink } from 'lucide-react';
import { ContentLoading } from '@/components/ui/content-loading';
import { FileUploadModal } from './FileUploadModal';
import { FileEditModal } from './FileEditModal';
import { FileDeleteModal } from './FileDeleteModal';
import { AddLinkModal } from './AddLinkModal';
import { LinkEditModal } from './LinkEditModal';
import { FileCard } from './FileCard';
import { LinkCard } from './LinkCard';
import { FilesFilters } from './components/FilesFilters';
import { useFilesFilters } from './hooks/useFilesFilters';
import type { FilesViewProps } from './types';
import { toast } from 'sonner';
import { getStatusColors } from '@/lib/themes/utils';

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
  
interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  permissions: string[];
}

export function FilesView({ projectId }: FilesViewProps) {
  const [allItems, setAllItems] = useState<ProjectFile[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkEditModalOpen, setIsLinkEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [selectedLink, setSelectedLink] = useState<ProjectLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the custom hook for filtering
  const {
    searchQuery,
    setSearchQuery,
    filterByUser,
    setFilterByUser,
    filteredFiles,
    filteredLinks,
    availableUsers,
  } = useFilesFilters(allItems, projectMembers);

  const fetchProjectData = useCallback(async () => {
    try {
      setPermissionsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/overview`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch project data');
      }

      const data = await response.json();
      setUserPermissions(data.project?.userPermissions || []);
      setIsLeader(data.project?.isLeader || false);
    } catch {
      // Don't set error state for project data fetch failure, just log it
    } finally {
      setPermissionsLoading(false);
    }
  }, [projectId]);

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/projects/${projectId}/files`);
      
      if (!response.ok) {
        const errorData = await response.json();
        // If permission error, just show error message
        if (response.status === 403 || response.status === 404) {
          setError(errorData.error || 'Permission denied');
        } else {
          throw new Error(errorData.error || 'Failed to fetch files');
        }
        return;
      }
      
      const data = await response.json();
      setAllItems(data.files || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchProjectMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch project members');
      }
      
      const members = await response.json();
      setProjectMembers(members || []);
    } catch {

      // Don't set error state for members fetch failure, just log it
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      Promise.all([fetchFiles(), fetchProjectMembers(), fetchProjectData()]);
    }
  }, [projectId, fetchFiles, fetchProjectMembers, fetchProjectData]);

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

  const handleEditFile = async (file: ProjectFile) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/overview`);
      if (!response.ok) {
        toast.error('Permission denied');
        return;
      }

      const data = await response.json();
      const currentPermissions = data.project?.userPermissions || [];
      const currentIsLeader = data.project?.isLeader || false;

      if (
        !currentIsLeader &&
        (!currentPermissions.includes('viewFiles') ||
         !currentPermissions.includes('handleFile'))
      ) {
        toast.error('You no longer have permission to edit files');
        return;
      }

      // Update state with fresh permissions
      setUserPermissions(currentPermissions);
      setIsLeader(currentIsLeader);

      setSelectedFile(file);
      setIsEditModalOpen(true);
    } catch {
      toast.error('Failed to verify permissions');
    }
  };

  const handleEditLink = async (link: ProjectLink) => {
    // Revalidate permissions before opening edit modal
    try {
      const response = await fetch(`/api/projects/${projectId}/overview`);
      if (!response.ok) {
        toast.error('Permission denied');
        await fetchProjectData(); // Refresh permissions
        return;
      }

      const data = await response.json();
      const currentPermissions = data.project?.userPermissions || [];
      const currentIsLeader = data.project?.isLeader || false;

      // Check if user still has BOTH viewFiles AND handleFile permissions
      if (!currentIsLeader && (!currentPermissions.includes('viewFiles') || !currentPermissions.includes('handleFile'))) {
        toast.error('You no longer have permission to edit links');
        await fetchProjectData(); // Refresh permissions
        return;
      }

      setSelectedLink(link);
      setIsLinkEditModalOpen(true);
    } catch {
      toast.error('Failed to verify permissions');
    }
  };

  const handleDeleteFile = (file: ProjectFile) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteLink = (link: ProjectLink) => {
    setSelectedLink(link);
    setIsDeleteModalOpen(true);
  };

  // Add permission validation for file access
  const handleFileClick = useCallback(async (file: ProjectFile) => {
    try {
      // Validate current permissions before allowing access
      const response = await fetch(`/api/projects/${projectId}/overview`);
      if (!response.ok) {
        toast.error('Permission denied');
        return;
      }
      
      const data = await response.json();
      const currentPermissions = data.project?.userPermissions || [];
      const currentIsLeader = data.project?.isLeader || false;
      
      // Check if user still has permission to view files
      if (!currentIsLeader && !currentPermissions.includes('viewFiles')) {
        toast.error('You no longer have permission to access this file');
        return;
      }
      
      // If permission check passes, open the file
      window.open(file.url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to verify permissions');
    }
  }, [projectId]);

  // Add permission validation for link access
  const handleLinkClick = useCallback(async (link: ProjectLink) => {
    try {
      // Validate current permissions before allowing access
      const response = await fetch(`/api/projects/${projectId}/overview`);
      if (!response.ok) {
        toast.error('Permission denied');
        return;
      }
      
      const data = await response.json();
      const currentPermissions = data.project?.userPermissions || [];
      const currentIsLeader = data.project?.isLeader || false;
      
      // Check if user still has permission to view files
      if (!currentIsLeader && !currentPermissions.includes('viewFiles')) {
        toast.error('You no longer have permission to access this link');
        return;
      }
      
      // If permission check passes, open the link
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to verify permissions');
    }
  }, [projectId]);

  // Permission checks - require BOTH viewFiles AND handleFile for management
  const canViewFiles = isLeader || userPermissions.includes('viewFiles');
  const canManageFiles = canViewFiles && (isLeader || userPermissions.includes('handleFile'));

  if (isLoading || permissionsLoading) {
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
              <Link className="h-4 w-4 mr-2" />
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

  // Check if user has permission to view files
  if (!canViewFiles) {
    const warningColors = getStatusColors('warning');
    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Files & Resources</h1>
            <p className="text-muted-foreground">Manage project files and external links</p>
          </div>
        </header>

        <Card className={`${warningColors.light} dark:${warningColors.dark} border-2`}>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FolderIcon className="h-16 w-16 mx-auto mb-4 opacity-80" />
              <h3 className="text-lg font-medium mb-2">
                Insufficient permissions to view files
              </h3>
              <p className="opacity-80">
                You don&apos;t have permission to view files and links in this project. Contact the project leader for access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if selected user has uploaded anything
  const selectedUser = availableUsers.find(user => user.name === filterByUser);
  const selectedUserHasUploads = selectedUser && allItems.some(item => 
    item.addedByName === selectedUser.name
  );
  const showNoUploadsMessage = filterByUser !== 'all' && selectedUser && !selectedUserHasUploads;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Files & Resources</h1>
          <p className="text-muted-foreground">Manage project files and external links</p>
        </div>
        <div className="flex gap-2">
          {canManageFiles && (
            <>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-primary/10"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Link className="h-4 w-4" />
                Upload File
              </Button>
              <Button 
                variant="outline"
                className="flex items-center gap-2 hover:bg-primary/10"
                onClick={() => setIsAddLinkModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Filters Section */}
      <div className="mb-8">
        <FilesFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterByUser={filterByUser}
          setFilterByUser={setFilterByUser}
          availableUsers={availableUsers}
        />
      </div>

      {/* Files and Resources List */}
      <section className="mt-8">
        {error && (
          <Card className="mb-4 border-[2px] border-dashed border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20 [border-spacing:4px]">
            <CardContent className="p-3">
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {showNoUploadsMessage ? (
          <Card className="border-[2px] border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 [border-spacing:4px]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <FolderIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-medium mb-1">No uploads from {selectedUser?.name}</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto text-sm">
                {selectedUser?.name} hasn&apos;t uploaded any files or added any links to this project yet.
              </p>
            </CardContent>
          </Card>
        ) : filteredFiles.length === 0 && filteredLinks.length === 0 ? (
          <Card className="border-[2px] border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 [border-spacing:4px]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <FolderIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-medium mb-1">
                {allItems.length === 0 ? "No files or links yet" : "No results found"}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto text-sm">
                {allItems.length === 0 
                  ? "Upload files or add links to Google Docs, Canva presentations, and other project resources."
                  : "Try adjusting your search or filter criteria to find what you&apos;re looking for."
                }
              </p>
              {allItems.length === 0 && canManageFiles && (
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 hover:bg-primary/10"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <Link className="h-4 w-4" />
                    Upload File
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-primary/10"
                    onClick={() => setIsAddLinkModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Responsive Layout: Two columns on large screens, single column on small */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Files Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">
                  Files ({filteredFiles.length})
                </h2>
                {allItems.filter(item => item.uploadThingId !== null).length !== filteredFiles.length && (
                  <span className="text-sm text-muted-foreground">
                    of {allItems.filter(item => item.uploadThingId !== null).length}
                  </span>
                )}
              </div>
              
              {filteredFiles.length === 0 ? (
                <Card className="border-[2px] border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 [border-spacing:4px]">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {allItems.filter(item => item.uploadThingId !== null).length === 0 
                        ? "No files uploaded yet"
                        : "No files match your current filters"
                      }
                    </p>
                    {allItems.filter(item => item.uploadThingId !== null).length === 0 && canManageFiles && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2 hover:bg-primary/10"
                        onClick={() => setIsUploadModalOpen(true)}
                      >
                        <Link className="h-4 w-4" />
                        Upload File
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file) => (
                    <FileCard 
                      key={file.id} 
                      file={file}
                      onClick={() => handleFileClick(file)}
                      {...(canManageFiles && {
                        onEdit: handleEditFile,
                        onDelete: handleDeleteFile
                      })}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Links Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">
                  Links ({filteredLinks.length})
                </h2>
                {allItems.filter(item => item.uploadThingId === null).length !== filteredLinks.length && (
                  <span className="text-sm text-muted-foreground">
                    of {allItems.filter(item => item.uploadThingId === null).length}
                  </span>
                )}
              </div>
              
              {filteredLinks.length === 0 ? (
                <Card className="border-[2px] border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 [border-spacing:4px]">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {allItems.filter(item => item.uploadThingId === null).length === 0 
                        ? "No links added yet"
                        : "No links match your current filters"
                      }
                    </p>
                    {allItems.filter(item => item.uploadThingId === null).length === 0 && canManageFiles && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2 hover:bg-primary/10"
                        onClick={() => setIsAddLinkModalOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Link
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {filteredLinks.map((link) => (
                    <LinkCard 
                      key={link.id} 
                      link={link}
                      onClick={() => handleLinkClick(link)}
                      {...(canManageFiles && {
                        onEdit: handleEditLink,
                        onDelete: handleDeleteLink
                      })}
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