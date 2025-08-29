import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { AddMemberModal } from '@/components/project/AddMemberModal';
import { cn } from '@/lib/utils';
import type { ProjectPermissions } from '../types';

interface EmptyStateProps {
  projectId: string;
  permissions: ProjectPermissions;
  onMemberAdded: () => void;
  currentMemberCount: number;
}

export function EmptyState({ projectId, permissions, onMemberAdded, currentMemberCount }: EmptyStateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canAddMembers = permissions.isLeader || permissions.userPermissions.includes('addMember');

  return (
    <Card>
      <CardHeader>
        <CardTitle>No members yet</CardTitle>
        <CardDescription>
          {canAddMembers 
            ? "Invite team members to collaborate on this project."
            : "This project doesn't have any members yet."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canAddMembers && (
          <>
            <button 
              className={cn(buttonVariants(), "flex items-center gap-2")}
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Invite First Member
            </button>
            <AddMemberModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              projectId={projectId}
              currentMemberCount={currentMemberCount}
              onMemberAdded={onMemberAdded}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
} 