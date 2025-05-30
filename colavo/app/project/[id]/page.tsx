import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ProjectView } from '@/components/project/ProjectView';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect('/login');
  }

  const { id: projectId } = await params;

  return (
    <div className="min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <ProjectView projectId={projectId} />
      </div>
    </div>
  );
}
