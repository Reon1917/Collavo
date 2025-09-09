"use client";

import React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, FileSpreadsheet, Calendar, User, Edit, Trash2, MoreVertical, Presentation } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/utils/date';

interface FileCardProps {
  file: {
    id: string;
    name: string;
    description?: string | null;
    url: string;
    size?: number | null;
    mimeType?: string | null;
    addedAt: string;
    addedByName: string;
    addedByEmail: string;
  };
  onClick?: () => void;
  onEdit?: (file: FileCardProps['file']) => void;
  onDelete?: (file: FileCardProps['file']) => void;
}

export function FileCard({ file, onClick, onEdit, onDelete }: FileCardProps) {
  const getFileIcon = (mimeType?: string | null) => {
    if (!mimeType) return <FileText className="h-8 w-8 text-primary/60" />;
    
    switch (mimeType) {
      case 'application/pdf':
        return <FileText className="h-8 w-8 text-primary" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileText className="h-8 w-8 text-primary" />;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return <FileSpreadsheet className="h-8 w-8 text-primary" />;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return <Presentation className="h-8 w-8 text-primary" />;
      default:
        return <FileText className="h-8 w-8 text-primary/60" />;
    }
  };

  const getFileExtension = (filename: string, mimeType?: string | null) => {
    if (!filename) return '';
    
    // First try to extract extension from filename
    const parts = filename.split('.');
    if (parts.length > 1) {
      const extension = parts[parts.length - 1];
      if (extension && extension.length > 0) {
        return extension.toUpperCase();
      }
    }
    
    // Fallback to mimeType for files without extensions (e.g., from Teams/macOS)
    if (mimeType) {
      switch (mimeType) {
        case 'application/pdf':
          return 'PDF';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return 'DOCX';
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return 'XLSX';
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return 'PPTX';
        case 'text/plain':
          return 'TXT';
        case 'text/csv':
          return 'CSV';
        case 'image/jpeg':
          return 'JPG';
        case 'image/png':
          return 'PNG';
        case 'image/gif':
          return 'GIF';
        case 'image/webp':
          return 'WEBP';
        default:
          return 'FILE';
      }
    }
    
    return 'FILE';
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: open file in new tab
      window.open(file.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(file);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(file);
    }
  };

  return (
    <Card 
      className="bg-white dark:bg-gray-900/50 hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 h-[140px]"
      onClick={handleClick}
    >
      <CardContent className="p-4 h-full">
        <div className="flex items-start gap-4 h-full">
          {/* File Icon */}
          <div className="flex-shrink-0">
            {getFileIcon(file.mimeType)}
          </div>

          {/* File Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {file.name}
                </h3>
                {file.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {file.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* File Type Badge */}
                <Badge variant="outline" className="text-xs">
                  {getFileExtension(file.name, file.mimeType)}
                </Badge>
                
                {/* Actions Menu */}
                {(onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* File Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-auto">
              {/* Upload Information */}
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{file.addedByName}</span>
              </div>
              
              {/* Upload Date */}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span title={formatDate(new Date(file.addedAt))}>
                  {formatRelativeTime(new Date(file.addedAt))}
                </span>
              </div>
              
              {/* File Size */}
              {file.size && (
                <div className="flex items-center gap-1">
                  <span>{formatFileSize(file.size)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 