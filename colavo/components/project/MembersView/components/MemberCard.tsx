import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, User } from 'lucide-react';
import type { Member } from '../types';

interface MemberCardProps {
  member: Member;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function MemberCard({ member }: MemberCardProps) {
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
        </div>
      </CardContent>
    </Card>
  );
} 