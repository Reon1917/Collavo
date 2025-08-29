"use client";


import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddMemberForm } from './AddMemberForm';
import { UserPlus } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentMemberCount: number;
  onMemberAdded?: () => void;
}

export function AddMemberModal({ 
  isOpen, 
  onClose, 
  projectId, 
  currentMemberCount,
  onMemberAdded 
}: AddMemberModalProps) {
  const maxMembers = 8;
  const isAtLimit = currentMemberCount >= maxMembers;

  const handleMemberAdded = () => {
    onMemberAdded?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Team Member
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Member count indicator - Smaller version */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Team Size
              </span>
              <div className={`text-lg font-bold ${
                isAtLimit 
                  ? 'text-red-600 dark:text-red-400' 
                  : currentMemberCount >= 6 
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-green-600 dark:text-green-400'
              }`}>
                {currentMemberCount}/{maxMembers}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isAtLimit 
                    ? 'bg-red-500' 
                    : currentMemberCount >= 6 
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${(currentMemberCount / maxMembers) * 100}%` }}
              />
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isAtLimit ? 'Team is at maximum capacity' : `${maxMembers - currentMemberCount} spots remaining`}
            </p>
          </div>

          {isAtLimit ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Team is Full
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This project has reached the maximum limit of 8 members. 
                To add new members, you&apos;ll need to remove existing ones first.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                You can manage team members from the Members tab.
              </p>
            </div>
          ) : (
            <AddMemberForm 
              projectId={projectId} 
              onMemberAdded={handleMemberAdded}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
