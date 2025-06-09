import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Crown, User, UserMinus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Member, ProjectPermissions } from '../types';

interface MemberCardProps {
  member: Member;
  permissions: ProjectPermissions;
  projectId: string;
  currentUserId?: string | null;
  onMemberRemoved?: () => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function MemberCard({ member, permissions, projectId, currentUserId, onMemberRemoved }: MemberCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Check if current user can manage members (same permission as addMember)
  const canManageMembers = permissions.isLeader || permissions.userPermissions.includes('addMember');
  
  // Don't show remove button for:
  // - Users who can't manage members
  // - The member trying to remove themselves
  // - Leaders (to prevent removing leaders)
  const canRemoveThisMember = canManageMembers && 
    member.userId !== currentUserId && 
    member.role !== 'leader';

  const handleRemoveMember = async () => {
    if (!member.userId) return;

    setIsRemoving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: member.userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to remove member');
        return;
      }

      toast.success(`${member.userName} has been removed from the project`);
      onMemberRemoved?.();
      setShowRemoveDialog(false);
    } catch {
      toast.error('Failed to remove member');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.userImage} alt={member.userName} />
              <AvatarFallback className="bg-[#008080] text-white">
                {getInitials(member.userName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {member.userName}
                </h3>
                {member.role === 'leader' && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
                {member.role === 'member' && (
                  <User className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {member.userEmail}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant={member.role === 'leader' ? 'default' : 'secondary'}
                className={member.role === 'leader' ? 'bg-[#008080] hover:bg-[#006666]' : ''}
              >
                {member.role}
              </Badge>
              {member.permissions.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {member.permissions.length} permission{member.permissions.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            {canRemoveThisMember && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                  onClick={() => setShowRemoveDialog(true)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
                
                <ConfirmationDialog
                  isOpen={showRemoveDialog}
                  onOpenChange={setShowRemoveDialog}
                  title="Remove Member"
                  description={`Are you sure you want to remove ${member.userName} from this project? This action cannot be undone and will permanently delete all tasks, events, files, and subtasks they created or were assigned to.`}
                  confirmText="Remove Member"
                  cancelText="Cancel"
                  onConfirm={handleRemoveMember}
                  isLoading={isRemoving}
                  variant="destructive"
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 