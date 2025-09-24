import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DashboardNavbar } from '@/components/ui/dashboard-navbar';
import { CreateProjectForm } from '@/components/project/CreateProjectForm';
import { CreateProjectThemeWrapper } from '@/components/project/CreateProjectThemeWrapper';

export default async function NewProjectPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect('/login');
  }

  return (
    <CreateProjectThemeWrapper>
      <DashboardNavbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              Create New Project
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Start organizing your ideas and collaborating with your team.
            </p>
          </div>

          {/* Form */}
          <CreateProjectForm />
        </div>
      </div>
    </CreateProjectThemeWrapper>
  );
} 