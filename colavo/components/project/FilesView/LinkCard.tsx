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
    if (domain.includes('github')) return 'bg-muted text-foreground dark:bg-muted ';
    if (domain.includes('notion')) return 'bg-muted text-foreground dark:bg-muted ';
    if (domain.includes('slack')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (domain.includes('discord')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
    
    return 'bg-muted text-foreground dark:bg-muted ';
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
      className="bg-background dark:bg-card/50 hover:shadow-md transition-all duration-200 cursor-pointer group border border-border dark:border-border hover:border-primary/50 dark:hover:border-primary/50 h-[140px]"
      onClick={handleClick}
    >
      <CardContent className="p-4 h-full">
        <div className="flex items-start gap-4 h-full">
          {/* Link Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-primary dark:text-primary" />
            </div>
          </div>

          {/* Link Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground dark:text-foreground truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {link.name}
                </h3>
                {link.description && (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1 line-clamp-2">
                    {link.description}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <ExternalLink className="h-3 w-3 text-primary/60" />
                  <span className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
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
            <div className="flex items-center gap-4 text-xs text-muted-foreground dark:text-muted-foreground mt-auto">
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