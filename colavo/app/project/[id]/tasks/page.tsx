import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { TasksView } from '@/components/project/TasksView/TasksView';

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect('/login');
  }

  const { id: projectId } = await params;

  return <TasksView projectId={projectId} />;
}
