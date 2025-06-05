"use client";

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Users, FileText, FolderOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatButton } from '@/components/project/chat-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { notFound, usePathname } from 'next/navigation';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';

interface Project {
  id: string;
  name: string;
  description?: string;
}

function SimpleBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(segment => segment);
  const projectId = segments[1];
  const currentSection = segments[2];

  return (
    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
      <Link 
        href="/dashboard" 
        className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-[#00FFFF]/20 rounded"
      >
        Home
      </Link>
      
      {projectId && (
        <>
          <ChevronRight className="h-4 w-4 mx-2.5 text-gray-400 dark:text-gray-600" />
          
          <Link 
            href={`/project/${projectId}`} 
            className={`font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-[#00FFFF]/20 rounded ${
              segments.length === 2 
                ? 'text-[#008080] dark:text-[#00FFFF]' 
                : 'text-gray-600 hover:text-[#008080] dark:text-gray-400 dark:hover:text-[#00FFFF]'
            }`}
          >
            Project
          </Link>
        </>
      )}
      
      {currentSection && (
        <>
          <ChevronRight className="h-4 w-4 mx-2.5 text-gray-400 dark:text-gray-600" />
          <span className="font-semibold text-[#008080] dark:text-[#00FFFF]">
            {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
          </span>
        </>
      )}
    </div>
  );
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
          const projectData: Project = await response.json();
          setProject(projectData);
        } else if (response.status === 404) {
          notFound();
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-7">
        {/* Add breadcrumb navigation above project header */}
        <SimpleBreadcrumb />
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[#008080] dark:bg-[#00FFFF] rounded-full"></div>
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-9 w-64 rounded"></div>
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project?.name || `Project ${projectId}`}
                </h1>
              )}
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
    params.then(({ id }) => {
      setProjectId(id);
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

  const links = [
    {
      label: "Back to Dashboard",
      href: "/dashboard",
      icon: <ArrowLeft className="h-5 w-5" />
    },
    {
      label: "Overview",
      href: `/project/${projectId}`,
      icon: <Home className="h-5 w-5" />
    },
    {
      label: "Tasks", 
      href: `/project/${projectId}/tasks`,
      icon: <FileText className="h-5 w-5" />
    },
    {
      label: "Members",
      href: `/project/${projectId}/members`, 
      icon: <Users className="h-5 w-5" />
    },
    {
      label: "Files",
      href: `/project/${projectId}/files`,
      icon: <FolderOpen className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
      <Sidebar animate={true}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Navigation Links */}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      
      {/* Main content - Adjust margin for fixed sidebar */}
      <div className="md:ml-[60px] transition-all duration-300">
        <ProjectHeader projectId={projectId} />
        
        <div className="flex-1 p-6">
          {children}
        </div>
        
        <ChatButton />
      </div>
    </div>
  );
}