"use client";

import React, { useState, useRef } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUploadThing } from '@/utils/uploadthing';
import { Loader2, X, Upload, FileText, FileSpreadsheet, File, Presentation } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onFileUploaded?: (file: any) => void;
}

interface SelectedFile {
  file: File;
  name: string;
  size: number;
}

export function FileUploadModal({
  isOpen,
  onOpenChange,
  projectId,
  onFileUploaded
}: FileUploadModalProps) {
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing('documentUploader', {
    onClientUploadComplete: async (res) => {
      if (res && res[0]) {
        await handleSaveToDatabase(res[0]);
      }
    },
    onUploadError: (error) => {
      const errorMessage = error.message || 'Upload failed. Please try again.';
      setUploadError(errorMessage);
      
      // Show toast for permission errors
      if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
        toast.error('Permission denied. You no longer have permission to upload files to this project.');
        handleClose(true); // Force close modal
      }
    },
  });

  const handleSaveToDatabase = async (uploadResult: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fileName.trim(),
          description: description.trim() || null,
          url: uploadResult.url,
          uploadThingId: uploadResult.key,
          size: selectedFile?.size || 0,
          mimeType: getMimeType(fileName),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If it's a permission error, show toast and force close modal
        if (response.status === 403 || response.status === 404) {
          toast.error(errorData.error || 'Permission denied');
          handleClose(true); // Force close even if uploading
          return;
        }
        throw new Error(errorData.error || 'Failed to save file');
      }

      const savedFile = await response.json();
      
      // Call the callback to update the parent component
      if (onFileUploaded) {
        onFileUploaded(savedFile);
      }
      
      // Close modal and reset
      handleClose();
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to save file');
    }
  };

  const handleReset = () => {
    setFileName('');
    setDescription('');
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleClose = (force = false) => {
    // Only allow closing if no file is selected or we're not uploading, or if forced
    if (force || !selectedFile || !isUploading) {
      handleReset();
      onOpenChange(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];

      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please select a PDF, DOCX, XLSX, or PPTX file.');
        return;
      }

      // Validate file size (4MB limit)
      if (file.size > 4 * 1024 * 1024) {
        setUploadError('File size must be less than 4MB.');
        return;
      }

      setSelectedFile({
        file,
        name: file.name,
        size: file.size,
      });
      
      // Auto-fill file name if not already set
      if (!fileName.trim()) {
        setFileName(file.name);
      }
      
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first.');
      return;
    }
    
    if (!fileName.trim()) {
      setUploadError('Please enter a file name.');
      return;
    }

    setUploadError(null);
    
    // Start the upload process
    await startUpload([selectedFile.file]);
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case 'pptx':
        return <Presentation className="h-6 w-6 text-orange-500" />;
      default:
        return <File className="h-6 w-6 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getMimeType = (filename: string): string => {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      default:
        return 'application/octet-stream';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </DialogTitle>
          <DialogDescription>
            Upload PDF, DOCX, XLSX, or PPTX files up to 4MB. Add a name and description for better organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-6">
          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name *</Label>
            <Input
              id="fileName"
              type="text"
              placeholder="Enter file name..."
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              maxLength={500}
              required
              disabled={isUploading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter file description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isUploading}
            />
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              {!selectedFile ? (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    You can upload PDF files, Word (.docx) files, Excel (.xlsx) files and PowerPoint (.pptx) files up to 4MB.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary hover:border-primary/90"
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.xlsx,.pptx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={isUploading}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{uploadError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose()}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || !fileName.trim() || isUploading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 