import { ReactNode } from 'react';
import Link from 'next/link';
import { getProjectById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { NavItem } from '@/components/project/nav-item';
import { ChatButton } from '@/components/project/chat-button';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const { id } = params;
  const project = await getProjectById(id);

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
        <Link 
          href="/dashboard" 
          className="text-blue-600 hover:underline"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold">Project Navigation</h2>
              </div>
              <div className="p-2">
                <NavItem href={`/project/${id}`} exact>
                  Overview
                </NavItem>
                <NavItem href={`/project/${id}/tasks`}>
                  Tasks & Events
                </NavItem>
                <NavItem href={`/project/${id}/files`}>
                  Files & Links
                </NavItem>
                <NavItem href={`/project/${id}/members`}>
                  Members
                </NavItem>
              </div>
            </nav>
          </aside>
          <main className="flex-1">
            <div className="mb-6">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      <ChatButton />
    </div>
  );
}
