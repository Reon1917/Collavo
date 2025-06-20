'use client';

import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { ContentLoading } from '@/components/ui/content-loading';
import { useMembersData } from './hooks';
import { MembersHeader, MemberCard, EmptyState } from './components';
import type { MembersViewProps } from './types';

export function MembersView({ projectId, onPermissionRefresh }: MembersViewProps) {
  const { members, permissions, currentUserId, isLoading, refreshMembers } = useMembersData(projectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Project Members</h1>
            <p className="text-muted-foreground">
              Manage team members and their roles in this project
            </p>
          </div>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
        <ContentLoading 
          size="md" 
          message="Loading project members..." 
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MembersHeader 
        projectId={projectId}
        permissions={permissions}
        onMemberAdded={refreshMembers}
      />



      {members.length === 0 ? (
        <EmptyState 
          projectId={projectId}
          permissions={permissions}
          onMemberAdded={refreshMembers}
        />
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <MemberCard 
              key={member.id} 
              member={member} 
              permissions={permissions}
              projectId={projectId}
              currentUserId={currentUserId}
              onMemberRemoved={refreshMembers}
              onMemberUpdated={refreshMembers}
              onPermissionRefresh={onPermissionRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
} 