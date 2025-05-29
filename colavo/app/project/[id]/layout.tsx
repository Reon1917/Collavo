import { ReactNode } from 'react';
import Link from 'next/link';
import { ChatButton } from '@/components/project/chat-button';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  // For now, we'll assume all projects exist since we don't have the backend implemented yet
  // In the future, you can add real project validation here

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Project Navigation</h2>
              <nav className="space-y-2">
                <Link 
                  href={`/project/${params.id}`}
                  className="block px-3 py-2 rounded-md hover:bg-blue-50 text-blue-600"
                >
                  Overview
                </Link>
                <Link 
                  href={`/project/${params.id}/tasks`}
                  className="block px-3 py-2 rounded-md hover:bg-blue-50 text-blue-600"
                >
                  Tasks
                </Link>
                <Link 
                  href={`/project/${params.id}/members`}
                  className="block px-3 py-2 rounded-md hover:bg-blue-50 text-blue-600"
                >
                  Members
                </Link>
                <Link 
                  href={`/project/${params.id}/files`}
                  className="block px-3 py-2 rounded-md hover:bg-blue-50 text-blue-600"
                >
                  Files
                </Link>
              </nav>
            </div>
          </div>
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Project {params.id}</h1>
                <p className="text-gray-600">Manage your project&apos;s tasks, members, and files</p>
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
