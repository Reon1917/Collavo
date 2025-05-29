import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardNavbar } from '@/components/ui/dashboard-navbar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PlusCircle, File, Users } from 'lucide-react';
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
        <header className="mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back to Collavo, {user.name}!</p>
          </div>
        </header>

        <div className="space-y-10">
          {/* Projects you lead */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Projects You Lead</h2>
            <div className="bg-white rounded-lg py-12 px-8 text-center border border-[#e5e4dd] shadow-sm">
              <h3 className="text-xl font-medium mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first project to get started
              </p>
              <Button className="bg-[#008080] hover:bg-[#008080]/90 text-white px-6 py-2 h-auto rounded-md" asChild>
                <Link href="/project/new">Create Project</Link>
              </Button>
            </div>
          </section>

          {/* Projects you're a member of */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Projects You're In</h2>
            <div className="bg-white rounded-lg py-12 px-8 text-center border border-[#e5e4dd] shadow-sm">
              <h3 className="text-xl font-medium mb-2">No memberships yet</h3>
              <p className="text-gray-600">
                You haven't been added to any projects as a member
              </p>
            </div>
          </section>

          {/* Quick Access */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Quick Access</h2>
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
      <div className="bg-white p-6 rounded-lg border border-[#e5e4dd] shadow-sm hover:shadow-md transition-shadow hover:border-[#00FFFF]">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
