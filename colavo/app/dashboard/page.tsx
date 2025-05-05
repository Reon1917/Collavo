import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getProjectsLedByUserId, getProjectsMembershipByUserId, getUserById } from '@/lib/data';
import { User } from 'lucide-react';

export default async function DashboardPage() {
  // Fetch the current user and their projects
  const currentUser = await getCurrentUser();
  const leadProjects = await getProjectsLedByUserId(currentUser.id);
  const memberProjects = await getProjectsMembershipByUserId(currentUser.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back to Collavo, {currentUser.name}!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/project/new">Create New Project</Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-10">
        {/* Projects you lead */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Projects You Lead</h2>
          {leadProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leadProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first project to get started
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/project/new">Create Project</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Projects you're a member of */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Projects You're In</h2>
          {memberProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memberProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No memberships yet</h3>
              <p className="text-gray-600">
                You haven't been added to any projects as a member
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

async function ProjectCard({ project }: { project: any }) {
  // Calculate days remaining until deadline
  const deadline = new Date(project.deadline);
  const today = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine status color based on days remaining
  let statusColor = 'bg-green-100 text-green-800';
  if (daysRemaining < 0) {
    statusColor = 'bg-red-100 text-red-800';
  } else if (daysRemaining <= 3) {
    statusColor = 'bg-yellow-100 text-yellow-800';
  }

  // Fetch user details for the first 3 members
  const memberDetails = await Promise.all(
    project.members.slice(0, 3).map(async (member: any) => {
      const user = await getUserById(member.userId);
      return {
        ...member,
        name: user?.name || `User ${member.userId}`,
        initials: user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : member.userId.charAt(member.userId.length - 1)
      };
    })
  );

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-5">
          <h3 className="text-xl font-semibold mb-2 truncate">{project.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
          
          <div className="flex justify-between items-center">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
              {daysRemaining < 0 
                ? 'Overdue' 
                : daysRemaining === 0 
                  ? 'Due today' 
                  : `${daysRemaining} days left`}
            </span>
            <div className="flex -space-x-2">
              {memberDetails.map((member) => (
                <div 
                  key={member.userId} 
                  className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                  title={member.name}
                >
                  {member.initials}
                </div>
              ))}
              {project.members.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs">
                  +{project.members.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
