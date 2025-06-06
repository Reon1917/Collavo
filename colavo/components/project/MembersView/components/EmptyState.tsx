import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { AddMemberForm } from '@/components/project/AddMemberForm';
import { cn } from '@/lib/utils';
import type { ProjectPermissions } from '../types';

interface EmptyStateProps {
  projectId: string;
  permissions: ProjectPermissions;
  onMemberAdded: () => void;
}

export function EmptyState({ projectId, permissions, onMemberAdded }: EmptyStateProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMemberAdded = () => {
    setIsDialogOpen(false);
    onMemberAdded();
  };

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className={cn(buttonVariants(), "flex items-center gap-2")}>
              <UserPlus className="h-4 w-4" />
              Invite First Member
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
      </CardContent>
    </Card>
  );
} 