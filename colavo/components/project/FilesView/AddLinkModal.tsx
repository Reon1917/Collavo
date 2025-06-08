"use client";

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Link, Plus } from 'lucide-react';

interface AddLinkModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onLinkAdded?: (link: any) => void;
}

export function AddLinkModal({
  isOpen,
  onOpenChange,
  projectId,
  onLinkAdded
}: AddLinkModalProps) {
  const [linkName, setLinkName] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleReset = () => {
    setLinkName('');
    setDescription('');
    setLinkUrl('');
    setAddError(null);
  };

  const handleClose = () => {
    if (!isAdding) {
      handleReset();
      onOpenChange(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkName.trim()) {
      setAddError('Please enter a link name.');
      return;
    }

    if (!linkUrl.trim()) {
      setAddError('Please enter a link URL.');
      return;
    }

    // Add protocol if missing
    let formattedUrl = linkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (!isValidUrl(formattedUrl)) {
      setAddError('Please enter a valid URL.');
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: linkName.trim(),
          description: description.trim() || null,
          url: formattedUrl,
          uploadThingId: null, // This marks it as a link, not a file
          size: null,
          mimeType: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add link');
      }

      const savedLink = await response.json();
      
      // Call the callback to update the parent component
      if (onLinkAdded) {
        onLinkAdded(savedLink);
      }
      
      // Close modal and reset
      handleClose();
      
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'Failed to add link');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Add Link
          </DialogTitle>
          <DialogDescription>
            Add an external link to your project resources. This could be a Canva design, Google Doc, or any other web resource.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Link Name */}
          <div className="space-y-2">
            <Label htmlFor="linkName">Link Name *</Label>
            <Input
              id="linkName"
              type="text"
              placeholder="e.g., Project Design, Meeting Notes..."
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              maxLength={500}
              required
              disabled={isAdding}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this link contains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isAdding}
            />
          </div>

          {/* Link URL */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL *</Label>
            <Input
              id="linkUrl"
              type="url"
              placeholder="https://example.com or canva.com/design/..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
              disabled={isAdding}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can paste the full URL here.
            </p>
          </div>

          {/* Error Message */}
          {addError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{addError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isAdding}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!linkName.trim() || !linkUrl.trim() || isAdding}
              className="flex-1 bg-[#008080] hover:bg-[#006666] text-white"
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 