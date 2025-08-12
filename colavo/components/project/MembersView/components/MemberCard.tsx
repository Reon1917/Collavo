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

  const handleManageClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setShowPermissionModal(true);
  };

  return (
    <>
      <Card 
        className={cn(
          `bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 rounded-xl shadow-sm transition-all group outline-none`,
          canManageThisMemberPermissions &&
            'hover:shadow-lg hover:border-primary/60 dark:hover:border-cyan-400 hover:bg-primary/5 dark:hover:bg-primary/10',
          className
        )}
      >
        <CardContent className="py-6 px-4 flex flex-col items-center">
          {/* Profile Section */}
          <div className="flex flex-col items-center gap-2 w-full">
            <Avatar className="h-24 w-24 shadow ring-2 ring-primary/20 mb-2">
              <AvatarImage src={member.userImage} alt={member.userName} />
              <AvatarFallback className="bg-[#008080] text-white text-2xl">
                {getInitials(member.userName)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate text-center w-full">
              {member.userName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight truncate text-center w-full">
              {member.userEmail}
            </p>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Info & Actions Section */}
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {member.role === 'leader' ? (
                <Badge
                  variant="default"
                  className="bg-[#008080] hover:bg-[#006666] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                >
                  <Crown className="h-3 w-3 mr-1 text-yellow-300" />
                  Leader
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                >
                  <User className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                  Member
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </span>
            {member.permissions.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {member.permissions.length} permission{member.permissions.length !== 1 ? 's' : ''}
              </span>
            )}
            <div className="flex items-center gap-2 mt-2 justify-center">
              {canManageThisMemberPermissions && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 px-3 py-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 border-cyan-200 dark:border-cyan-700"
                  aria-label={`Manage permissions for ${member.userName}`}
                  onClick={handleManageClick}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleManageClick(e);
                    }
                  }}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Manage</span>
                </Button>
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