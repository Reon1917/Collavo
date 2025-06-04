import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ProjectView } from '@/components/project/ProjectView/ProjectView';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect('/login');
  }

  const { id: projectId } = await params;

  return <ProjectView projectId={projectId} />;
}
