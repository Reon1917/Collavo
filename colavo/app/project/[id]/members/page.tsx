"use client"

import { getProjectById, getUserById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ProjectMember, User } from '@/types';
import { useState, useEffect } from 'react';
import { PermissionModal } from '@/components/members/user-permission-modal';

export default function MembersPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch project data on client-side
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await getProjectById(id);
        setProject(projectData);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!project) {
    return <div className="p-8">Project not found</div>;
  }

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Members</h1>
          <p className="text-gray-600">{project.members.length} members</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Invite Member
        </Button>
      </header>

      {/* Members List */}
      <section>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Project Team</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {project.members.map((member: ProjectMember) => (
              <MemberItem 
                key={member.userId} 
                member={member} 
                isLeader={project.leader === member.userId} 
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MemberItem({ member, isLeader }: { member: ProjectMember; isLeader: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
  
  // Fetch user data on client-side
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(member.userId);
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [member.userId]);
  
  if (!user) return <div className="p-4">Loading user...</div>;
  
  // Determine role badge color
  const roleBadgeColors: Record<string, string> = {
    'leader': 'bg-purple-100 text-purple-800',
    'member': 'bg-blue-100 text-blue-800',
    'viewer': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mr-4">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{user.name}</h3>
          <div className="flex items-center text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColors[member.role] || ''}`}>
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-500">
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isLeader ? (
            <Button variant="outline" size="sm" className="text-gray-700">
              Project Owner
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700"
              onClick={() => setPermissionModalOpen(true)}
            >
              Manage Permissions
            </Button>
          )}
        </div>
      </div>
      
      {/* Permission Modal */}
      {!isLeader && (
        <PermissionModal
          isOpen={isPermissionModalOpen}
          onClose={() => setPermissionModalOpen(false)}
          member={{
            id: member.userId,
            name: user.name,
            role: member.role,
            avatar: user.name.charAt(0)
          }}
        />
      )}
    </div>
  );
}
