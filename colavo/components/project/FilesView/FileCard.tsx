"use client";

import React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, FileSpreadsheet, FileImage, Calendar, User } from 'lucide-react';
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
}

export function FileCard({ file, onClick }: FileCardProps) {
  const getFileIcon = (mimeType?: string | null) => {
    if (!mimeType) return <FileText className="h-8 w-8 text-gray-400" />;
    
    switch (mimeType) {
      case 'application/pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-400" />;
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
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



  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer group border-gray-200 dark:border-gray-700"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="flex-shrink-0">
            {getFileIcon(file.mimeType)}
          </div>

          {/* File Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {file.name}
                </h3>
                {file.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {file.description}
                  </p>
                )}
              </div>
              
              {/* File Type Badge */}
              <Badge variant="outline" className="text-xs">
                {getFileExtension(file.name)}
              </Badge>
            </div>

            {/* File Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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