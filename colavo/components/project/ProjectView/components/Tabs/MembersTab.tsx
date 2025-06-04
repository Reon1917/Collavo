"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Settings } from 'lucide-react';
import { AddMemberForm } from '@/components/project/AddMemberForm';
import { Project } from '@/hooks/shared/useProjectData';
import { formatInitials } from '@/utils/format';

interface MembersTabProps {
  project: Project;
  permissions: {
    canAddMembers: boolean;
    canManagePermissions: boolean;
  };
  onRefresh: () => void;
}

export function MembersTab({ project, permissions, onRefresh }: MembersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h2>
      </div>
      
      {permissions.canAddMembers && (
        <div className="mb-6">
          <AddMemberForm 
            projectId={project.id} 
            onMemberAdded={onRefresh}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {project.members.map((member) => (
          <div key={member.id} className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-3 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.userImage || ''} alt={member.userName} />
                <AvatarFallback className="bg-[#008080] text-white text-xs">
                  {formatInitials(member.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {member.userName}
                  </p>
                  {member.role === 'leader' && (
                    <Crown className="h-3 w-3 text-[#008080] flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {member.userEmail}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge 
                  variant={member.role === 'leader' ? "default" : "secondary"}
                  className={`text-xs ${member.role === 'leader'
                    ? "bg-[#008080] text-white" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {member.role === 'leader' ? 'Leader' : 'Member'}
                </Badge>
                {member.userId === project.currentUserId && (
                  <span className="text-xs text-[#008080] font-medium">You</span>
                )}
              </div>
              
              {member.permissions.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {member.permissions.length} permission{member.permissions.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {permissions.canManagePermissions && member.userId !== project.currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 h-6 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Settings className="h-3 w-3 mr-1" />
                Manage
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 