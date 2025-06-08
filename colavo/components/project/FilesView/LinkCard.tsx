"use client";

import React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link as LinkIcon, ExternalLink, Calendar, User, Edit, Trash2, MoreVertical } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/utils/date';

interface LinkCardProps {
  link: {
    id: string;
    name: string;
    description?: string | null;
    url: string;
    addedAt: string;
    addedByName: string;
    addedByEmail: string;
  };
  onClick?: () => void;
  onEdit?: (link: LinkCardProps['link']) => void;
  onDelete?: (link: LinkCardProps['link']) => void;
}

export function LinkCard({ link, onClick, onEdit, onDelete }: LinkCardProps) {
  const getDomainFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'External Link';
    }
  };

  const getDomainBadgeColor = (url: string): string => {
    const domain = getDomainFromUrl(url).toLowerCase();
    
    if (domain.includes('canva')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    if (domain.includes('figma')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    if (domain.includes('google')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    if (domain.includes('github')) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    if (domain.includes('notion')) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    if (domain.includes('slack')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (domain.includes('discord')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: open link in new tab
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(link);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(link);
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer group border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Link Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {/* Link Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {link.name}
                </h3>
                {link.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {link.description}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {getDomainFromUrl(link.url)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Domain Badge */}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getDomainBadgeColor(link.url)} border-transparent`}
                >
                  {getDomainFromUrl(link.url)}
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

            {/* Link Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {/* Added By */}
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{link.addedByName}</span>
              </div>
              
              {/* Added Date */}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span title={formatDate(new Date(link.addedAt))}>
                  {formatRelativeTime(new Date(link.addedAt))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 