import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AddMemberModal } from '@/components/project/AddMemberModal';
import { cn } from '@/lib/utils';
import type { ProjectPermissions } from '../types';

interface MembersHeaderProps {
  projectId: string;
  permissions: ProjectPermissions;
  onMemberAdded: () => void;
  currentMemberCount: number;
}

export function MembersHeader({ projectId, permissions, onMemberAdded, currentMemberCount }: MembersHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canAddMembers = permissions.isLeader || permissions.userPermissions.includes('addMember');

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Project Members</h1>
        <p className="text-muted-foreground">
          Manage team members and their roles in this project
        </p>
      </div>
      {canAddMembers && (
        <>
          <button 
            className={cn(buttonVariants(), "flex items-center gap-2")}
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
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
    </div>
  );
} 