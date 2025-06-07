"use client";

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadDropzone } from '@/utils/uploadthing';
import { Loader2, X, CheckCircle, Upload } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onFileUploaded?: (file: any) => void;
}

interface UploadedFile {
  url: string;
  key: string;
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
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleReset = () => {
    setFileName('');
    setDescription('');
    setUploadedFile(null);
    setUploadError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleFileUpload = (res: any[]) => {
    const file = res[0];
    if (file) {
      setUploadedFile({
        url: file.url,
        key: file.key,
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

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setUploadError(error.message || 'Upload failed. Please try again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      setUploadError('Please upload a file first.');
      return;
    }
    
    if (!fileName.trim()) {
      setUploadError('Please enter a file name.');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fileName.trim(),
          description: description.trim() || null,
          url: uploadedFile.url,
          uploadThingId: uploadedFile.key,
          size: uploadedFile.size,
          mimeType: getMimeType(uploadedFile.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
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
      console.error('Error saving file:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to save file');
    } finally {
      setIsSubmitting(false);
    }
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
      default:
        return 'application/octet-stream';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </DialogTitle>
          <DialogDescription>
            Upload PDF, DOCX, or XLSX files up to 4MB. Add a name and description for better organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">File Upload</Label>
            {!uploadedFile ? (
              <UploadDropzone
                endpoint="documentUploader"
                onClientUploadComplete={handleFileUpload}
                onUploadError={handleUploadError}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                appearance={{
                  container: "w-full",
                  uploadIcon: "text-gray-400 mb-4",
                  label: "text-gray-600 dark:text-gray-400 text-sm mb-4",
                  allowedContent: "hidden",
                  button: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-[#008080] text-white shadow-xs hover:bg-[#006666] ut-ready:bg-[#008080] ut-ready:text-white ut-uploading:bg-[#006666]",
                }}
                content={{
                  label: "You can upload pdf files, word(.docx) files and excel(.xlsx) files up to 5MB.",
                  allowedContent: "",
                }}
              />
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFile(null)}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

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
            />
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
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!uploadedFile || isSubmitting || !fileName.trim()}
              className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Done'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 