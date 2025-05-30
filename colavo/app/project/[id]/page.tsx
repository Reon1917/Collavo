import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DashboardNavbar } from '@/components/ui/dashboard-navbar';
import { ProjectView } from '@/components/project/ProjectView';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <ProjectView projectId={params.id} />
      </div>
    </div>
  );
}
