"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Crown, User, Loader2 } from 'lucide-react';
import { AddMemberForm } from '@/components/project/AddMemberForm';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  permissions: string[];
}

interface MembersPageProps {
  params: Promise<{ id: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { id: projectId } = await params;

  return <MembersPageClient projectId={projectId} />;
}

function MembersPageClient({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/members`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Project not found or access denied');
          return;
        }
        throw new Error('Failed to fetch members');
      }

      const membersData = await response.json();
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load project members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleMemberAdded = () => {
    // Close dialog and refresh members list
    setIsDialogOpen(false);
    fetchMembers();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Project Members</h1>
          <p className="text-muted-foreground">
            Manage team members and their roles in this project
          </p>
        </div>
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
      </div>

      {members.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No members yet</CardTitle>
            <CardDescription>
              Invite team members to collaborate on this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <Card key={member.id} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700">
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
          ))}
        </div>
      )}
    </div>
  );
}
