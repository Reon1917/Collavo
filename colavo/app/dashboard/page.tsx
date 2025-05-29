import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { User, PlusCircle, File, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Include the Navbar at the top */}
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back to Collavo, {user.name}!</p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/project/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Project
              </Link>
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
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first project to get started
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/project/new">Create Project</Link>
              </Button>
            </div>
          </section>

          {/* Projects you're a member of */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Projects You&apos;re In</h2>
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <h3 className="text-lg font-medium mb-2">No memberships yet</h3>
              <p className="text-gray-600">
                You haven&apos;t been added to any projects as a member
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
                icon={<PlusCircle className="h-8 w-8 text-blue-600" />}
                href="/project/new"
              />
              <QuickAccessCard 
                title="Manage Files" 
                description="Upload and organize your project files"
                icon={<File className="h-8 w-8 text-green-600" />}
                href="/dashboard"
              />
              <QuickAccessCard 
                title="Team Collaboration" 
                description="Coordinate with your team members"
                icon={<Users className="h-8 w-8 text-purple-600" />}
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
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
