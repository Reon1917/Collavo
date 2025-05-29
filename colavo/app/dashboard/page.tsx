import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardNavbar } from '@/components/ui/dashboard-navbar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PlusCircle, File, Users, FolderOpen, UserPlus } from 'lucide-react';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  // Get the current user using better-auth
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect('/login');
  }
  
  const user = session.user;

  // For now, we don't have project data, so we'll show a clean dashboard
  // In the future, you can replace this with actual project data

  return (
    <div className="min-h-screen bg-[#f9f8f0]">
      {/* Use the new DashboardNavbar for a more minimal design */}
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back to Collavo, {user.name}!</p>
          </div>
        </header>

        <div className="space-y-12">
          {/* Projects you lead */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Projects You Lead</h2>
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200/60 shadow-md backdrop-blur-sm">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#008080] rounded-full mb-6 shadow-lg">
                  <FolderOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">No projects yet</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Take the lead and create your first project. Organize your team, set goals, and bring your ideas to life.
                </p>
                <Button 
                  className="bg-[#008080] hover:bg-[#006666] text-white px-8 py-3 h-auto rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium" 
                  asChild
                >
                  <Link href="/project/new">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create Your First Project
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Projects you're a member of */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Projects You're In</h2>
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200/60 shadow-md backdrop-blur-sm">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-500 rounded-full mb-6 shadow-lg">
                  <UserPlus className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">No memberships yet</h3>
                <p className="text-gray-600 leading-relaxed">
                  You haven't been added to any projects as a member. Create a project or wait for team invitations to get started.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Access */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickAccessCard 
                title="Create Project" 
                description="Start a new project and invite team members"
                icon={<PlusCircle className="h-8 w-8 text-[#008080]" />}
                href="/project/new"
              />
              <QuickAccessCard 
                title="Manage Files" 
                description="Upload and organize your project files"
                icon={<File className="h-8 w-8 text-[#00FFFF]" />}
                href="/dashboard"
              />
              <QuickAccessCard 
                title="Team Collaboration" 
                description="Coordinate with your team members"
                icon={<Users className="h-8 w-8 text-[#008080]" />}
                href="/dashboard"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function QuickAccessCard({ 
  title, 
  description, 
  icon, 
  href 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-md hover:shadow-lg transition-all duration-200 hover:border-[#00FFFF]/30 backdrop-blur-sm group">
        <div className="mb-4 group-hover:scale-110 transition-transform duration-200">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
