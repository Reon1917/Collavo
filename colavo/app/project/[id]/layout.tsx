"use client";

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Users, FileText, FolderOpen, AlignLeft } from 'lucide-react';
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
          setIsLoading(false);
        } else {
          setIsLoading(false);
          if (response.status === 404 || response.status === 403) {
            notFound();
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setIsLoading(false);
        // For network errors, still try to show something
        setProject({ id: projectId, name: `Project ${projectId}` });
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#008080] rounded-full"></div>
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-48 rounded"></div>
                ) : (
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {project?.name || `Project ${projectId}`}
                  </h1>
                )}
              </div>
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setProjectId(id);
      
      // Fetch project data to get the name
      const fetchProjectData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/projects/${id}`, {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            const projectData = await response.json();
            setProjectName(projectData.name || `Project ${id}`);
          } else {
            setProjectName(`Project ${id}`);
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching project:', error);
          setProjectName(`Project ${id}`);
          setIsLoading(false);
        }
      };
      
      fetchProjectData();
    });
  }, [params]);

  if (!projectId) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-16"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080] dark:border-[#00FFFF]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
      {/* Sidebar */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 
          ${isExpanded ? 'w-64' : 'w-16'} 
          bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700`}
      >
        {/* Toggle button area */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            {isExpanded && !isLoading && (
              <div className="text-xl font-bold text-[#008080] dark:text-[#00FFFF] truncate">
                {projectName}
              </div>
            )}
            {isExpanded && isLoading && (
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-[#008080] dark:hover:text-white"
            >
              <AlignLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6">
          <SidebarLink 
            href={`/project/${projectId}`} 
            icon={<Home />} 
            label="Overview" 
            isExpanded={isExpanded} 
          />
          <SidebarLink 
            href={`/project/${projectId}/tasks`} 
            icon={<FileText />} 
            label="Tasks" 
            isExpanded={isExpanded} 
          />
          <SidebarLink 
            href={`/project/${projectId}/members`} 
            icon={<Users />} 
            label="Members" 
            isExpanded={isExpanded} 
          />
          <SidebarLink 
            href={`/project/${projectId}/files`} 
            icon={<FolderOpen />} 
            label="Files" 
            isExpanded={isExpanded} 
          />
        </nav>
      </div>
      
      {/* Main content */}
      <div className={`flex-1 ${isExpanded ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <ProjectHeader projectId={projectId} />
        
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            {children}
          </div>
        </div>
        
        <ChatButton />
      </div>
    </div>
  );
}

// Sidebar link component
function SidebarLink({ 
  href, 
  icon, 
  label, 
  isExpanded 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  isExpanded: boolean;
}) {
  return (
    <Link 
      href={href}
      className={`flex items-center py-3 px-4 text-gray-700 hover:text-[#008080] hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#008080]/20 transition-colors ${
        !isExpanded ? 'justify-center' : ''
      }`}
    >
      <div className="text-[#008080] dark:text-[#00FFFF]">{icon}</div>
      {isExpanded && <span className="ml-3">{label}</span>}
    </Link>
  );
}
