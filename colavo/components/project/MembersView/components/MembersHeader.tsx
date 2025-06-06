import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { AddMemberForm } from '@/components/project/AddMemberForm';
import { cn } from '@/lib/utils';
import type { ProjectPermissions } from '../types';

interface MembersHeaderProps {
  projectId: string;
  permissions: ProjectPermissions;
  onMemberAdded: () => void;
}

export function MembersHeader({ projectId, permissions, onMemberAdded }: MembersHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMemberAdded = () => {
    setIsDialogOpen(false);
    onMemberAdded();
  };

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className={cn(buttonVariants(), "flex items-center gap-2")}>
            <UserPlus className="h-4 w-4" />
            Invite Member
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to this project.
              </DialogDescription>
            </DialogHeader>
            <AddMemberForm 
              projectId={projectId} 
              onMemberAdded={handleMemberAdded}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 