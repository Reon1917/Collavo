"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export default function MembersPage() {
  // Mock empty members for now - replace with real data later
  const members: never[] = [];

  const handleInviteMember = () => {
    // TODO: Implement member invitation when backend is ready
    console.log('Invite member clicked');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Project Members</h1>
          <p className="text-muted-foreground">
            Manage team members and their roles in this project
          </p>
        </div>
        <Button onClick={handleInviteMember}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
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
            <Button onClick={handleInviteMember}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite First Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Members will be displayed here when backend is implemented */}
          <p className="text-center text-gray-500 py-8">
            Member list will be implemented when backend is ready
          </p>
        </div>
      )}

      {/* TODO: Add invite member dialog component when needed */}
    </div>
  );
}
