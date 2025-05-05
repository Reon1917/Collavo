import { getProjectById, getUserById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ProjectMember, User } from '@/types';

export default async function MembersPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const project = await getProjectById(id);

  if (!project) {
    return null; // This will be handled by the layout
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

async function MemberItem({ member, isLeader }: { member: ProjectMember; isLeader: boolean }) {
  const user = await getUserById(member.userId);
  
  if (!user) return null;
  
  // Determine role badge color
  const roleBadgeColors = {
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
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColors[member.role]}`}>
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
            <Button variant="outline" size="sm" className="text-gray-700">
              Manage Role
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
