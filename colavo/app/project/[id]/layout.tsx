"use client";

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Users, FileText, FolderOpen, AlignLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatButton } from '@/components/project/chat-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { notFound, usePathname } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description?: string;
}

// Simple breadcrumb component with home icon and chevrons
function SimpleBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const isProjectPage = segments.length >= 2 && segments[0] === 'project';
  const projectId = isProjectPage ? segments[1] : '';
  const currentSection = segments.length > 2 ? segments[2] : '';

  return (
    <div className="flex items-center mb-5 text-base">
      <Link 
        href="/dashboard" 
        className="flex items-center font-medium text-gray-600 hover:text-[#008080] transition-colors duration-200 dark:text-gray-400 dark:hover:text-[#00FFFF] focus:outline-none focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-[#00FFFF]/20 rounded"
      >
        <Home className="h-4 w-4 mr-1.5" />
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
      <div className="container mx-auto px-6 py-7">
        {/* Add breadcrumb navigation above project header */}
        <SimpleBreadcrumb />
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-7">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="text-[#008080] hover:text-[#008080] hover:bg-[#008080]/10 dark:text-[#00FFFF] dark:hover:text-[#00FFFF] dark:hover:bg-[#00FFFF]/10 transition-colors duration-200"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
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
        <div className="p-5">
          <div className="flex items-center justify-between">
            {isExpanded && !isLoading && (
              <div className="text-xl font-bold text-[#008080] dark:text-[#00FFFF] truncate">
                {projectName}
              </div>
            )}
            {isExpanded && isLoading && (
              <div className="h-7 w-36 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md text-gray-500 hover:text-[#008080] hover:bg-[#008080]/10 dark:text-gray-400 dark:hover:text-[#00FFFF] dark:hover:bg-[#00FFFF]/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-[#00FFFF]/20"
            >
              <AlignLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8">
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
        
        <div className="container mx-auto px-7 py-9">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8 transition-all duration-200 hover:shadow-lg">
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
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  
  return (
    <Link 
      href={href}
      className={`flex items-center py-3.5 px-5 text-gray-700 transition-all duration-200
        ${isActive 
          ? 'text-[#008080] bg-[#008080]/10 dark:text-[#00FFFF] dark:bg-[#00FFFF]/10' 
          : 'hover:text-[#008080] hover:bg-[#008080]/5 dark:text-gray-300 dark:hover:text-[#00FFFF] dark:hover:bg-[#00FFFF]/5'
        }
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#008080]/20 dark:focus:ring-[#00FFFF]/20
        ${!isExpanded ? 'justify-center' : ''}
      `}
    >
      <div className={isActive ? 'text-[#008080] dark:text-[#00FFFF]' : 'text-gray-500 dark:text-gray-400 group-hover:text-[#008080] dark:group-hover:text-[#00FFFF]'}>
        {icon}
      </div>
      {isExpanded && <span className="ml-3.5 font-medium">{label}</span>}
    </Link>
  );
}