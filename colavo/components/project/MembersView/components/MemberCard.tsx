import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Crown, User, UserMinus, Settings } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PermissionModal } from '@/components/members/user-permission-modal';
import { makePermissionAwareRequest } from '@/utils/permissions';
import type { Member, ProjectPermissions } from '../types';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: Member;
  permissions: ProjectPermissions;
  projectId: string;
  currentUserId?: string | null;
  onMemberRemoved?: () => void;
  onMemberUpdated?: () => void;
  onPermissionRefresh?: (() => void) | undefined;
  className?: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function MemberCard({ member, permissions, projectId, currentUserId, onMemberRemoved, onMemberUpdated, onPermissionRefresh, className }: MemberCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Check if current user can manage members (same permission as addMember)
  const canManageMembers = permissions.isLeader || permissions.userPermissions.includes('addMember');
  
  // Don't show remove button for:
  // - Users who can't manage members
  // - The member trying to remove themselves
  // - Leaders (to prevent removing leaders)
  const canRemoveThisMember = canManageMembers && 
    member.userId !== currentUserId && 
    member.role !== 'leader';

  // Check if current user can manage permissions (only leaders)
  const canManagePermissions = permissions.isLeader;
  
  // Show permission management for members (not leaders) and only if user can manage permissions
  const canManageThisMemberPermissions = canManagePermissions && 
    member.role !== 'leader' && 
    member.userId !== currentUserId;

  const handleRemoveMember = async () => {
    if (!member.userId) return;

    setIsRemoving(true);
    try {
      await makePermissionAwareRequest(
        () => fetch(`/api/projects/${projectId}/members`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: member.userId,
          }),
        }),
        onPermissionRefresh
      );

      toast.success(`${member.userName} has been removed from the project`);
      onMemberRemoved?.();
      setShowRemoveDialog(false);
    } catch (error) {
      // Permission-aware error handling already done by makePermissionAwareRequest
      // Only show generic error if it's not a permission-related issue
      if (error instanceof Error && 
          !error.message.includes('permission') &&
          !error.message.includes('access to this project') &&
          !error.message.includes('Project not found') &&
          !error.message.includes('revoked')) {
        toast.error('Failed to remove member');
      }
    } finally {
      setIsRemoving(false);
    }
  };

  const handlePermissionUpdate = () => {
    // Refresh member data after permission update
    onMemberUpdated?.();
    setShowPermissionModal(false);
  };

  const handleCardClick = () => {
    // Only open permission modal if user can manage permissions and it's not the leader
    if (canManageThisMemberPermissions) {
      setShowPermissionModal(true);
    }
  };

  return (
    <>
      <Card 
        className={cn(
          `bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 rounded-xl shadow-sm transition-all group outline-none`,
          canManageThisMemberPermissions &&
            'hover:shadow-lg hover:border-primary/60 dark:hover:border-primary/40 hover:bg-primary/5 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary',
          className
        )}
        tabIndex={canManageThisMemberPermissions ? 0 : undefined}
        role={canManageThisMemberPermissions ? 'button' : undefined}
        aria-label={canManageThisMemberPermissions ? `Manage permissions for ${member.userName}` : undefined}
        onClick={handleCardClick}
      >
        <CardContent className="py-2.5 px-8">
          <div className="flex items-center justify-between min-h-[64px]">
            <div className="flex items-center gap-8 min-w-0">
              <Avatar className="h-14 w-14 shadow ring-2 ring-primary/20 flex-shrink-0">
                <AvatarImage src={member.userImage} alt={member.userName} />
                <AvatarFallback className="bg-[#008080] text-white text-xl">
                  {getInitials(member.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-center space-y-0 min-w-0">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate max-w-xs">
                    {member.userName}
                  </h3>
                  <Badge 
                    variant={member.role === 'leader' ? 'default' : 'secondary'}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs capitalize ml-3',
                      member.role === 'leader' ? 'bg-[#008080] hover:bg-[#006666]' : ''
                    )}
                  >
                    {member.role}
                  </Badge>
                  {member.role === 'leader' && (
                    <Crown className="h-4 w-4 text-yellow-500 ml-1" />
                  )}
                  {member.role === 'member' && (
                    <User className="h-4 w-4 text-gray-500 ml-1" />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight truncate max-w-xs">
                  {member.userEmail}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                  {member.permissions.length > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      • {member.permissions.length} permission{member.permissions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-[70px]">
              {canManageThisMemberPermissions && (
                <div className="text-xs text-[#008080] dark:text-[#00a3a3] flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Manage</span>
                </div>
              )}
              {canRemoveThisMember && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20 p-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking remove button
                      setShowRemoveDialog(true);
                    }}
                    aria-label={`Remove ${member.userName}`}
                  >
                    <UserMinus className="h-5 w-5" />
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

      {/* Permission Modal */}
      {canManageThisMemberPermissions && (
        <PermissionModal
          isOpen={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          onSave={handlePermissionUpdate}
          member={member}
          projectId={projectId}
        />
      )}
    </>
  );
} 