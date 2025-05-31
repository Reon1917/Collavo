"use client";

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatButton } from '@/components/project/chat-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { notFound } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description?: string;
}

function ProjectHeader({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          const projectData = await response.json();
          setProject(projectData);
        }
      } catch {
        setIsLoading(false);
        // User doesn't have access to this project
        notFound();
      }
    };

    fetchProject();
  }, [projectId]);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-48 rounded"></span>
                ) : (
                  project?.name || `Project ${projectId}`
                )}
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => setProjectId(id));
  }, [params]);

  if (!projectId) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-16"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
      {/* Header with back button and theme toggle */}
      <ProjectHeader projectId={projectId} />

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
              {children}
            </div>
          </div>
        </div>
      </div>

      <ChatButton />
    </div>
  );
}
