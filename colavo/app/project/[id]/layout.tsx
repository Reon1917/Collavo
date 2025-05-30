import { ReactNode } from 'react';
import Link from 'next/link';
import { ChatButton } from '@/components/project/chat-button';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  // For now, we'll assume all projects exist since we don't have the backend implemented yet
  // In the future, you can add real project validation here

  const { id: projectId } = await params;

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Project Navigation</h2>
              <nav className="space-y-2">
                <Link 
                  href={`/project/${projectId}`}
                  className="block px-3 py-2 rounded-md hover:bg-[#008080] hover:text-white text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                >
                  Overview
                </Link>
                <Link 
                  href={`/project/${projectId}/tasks`}
                  className="block px-3 py-2 rounded-md hover:bg-[#008080] hover:text-white text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                >
                  Tasks
                </Link>
                <Link 
                  href={`/project/${projectId}/members`}
                  className="block px-3 py-2 rounded-md hover:bg-[#008080] hover:text-white text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                >
                  Members
                </Link>
                <Link 
                  href={`/project/${projectId}/files`}
                  className="block px-3 py-2 rounded-md hover:bg-[#008080] hover:text-white text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                >
                  Files
                </Link>
              </nav>
            </div>
          </div>
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project {projectId}</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your project&apos;s tasks, members, and files</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>

      <ChatButton />
    </div>
  );
}
