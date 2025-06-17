"use client";

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Users, FileText, FolderOpen, Calendar, ChevronRight } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

import { ChatButton } from '@/components/project/chat-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { notFound } from 'next/navigation';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { ContentLoading } from '@/components/ui/content-loading';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface SimpleBreadcrumbProps {
  projectName: string;
}

function SimpleBreadcrumb({ projectName }: SimpleBreadcrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'tasks':
        return 'Tasks';
      case 'events':
        return 'Events';
      case 'members':
        return 'Members';
      case 'files':
        return 'Files';
      default:
        return 'Overview';
    }
  };

  return (
    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
      <Link 
        href="/dashboard" 
        className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-[#00FFFF]/20 rounded"
      >
        Home
      </Link>
      
      <ChevronRight className="h-4 w-4 mx-2.5 text-gray-400 dark:text-gray-600" />
      
      <Link
        href="/dashboard"
        className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-[#00FFFF]/20 rounded"
      >
        Projects
      </Link>

      <ChevronRight className="h-4 w-4 mx-2.5 text-gray-400 dark:text-gray-600" />
      
      <span className="font-semibold text-[#008080] dark:text-[#00FFFF]">
        {projectName}
      </span>

      {currentTab && currentTab !== 'overview' && (
        <>
          <ChevronRight className="h-4 w-4 mx-2.5 text-gray-400 dark:text-gray-600" />
          <span className="font-semibold text-[#008080] dark:text-[#00FFFF]">
            {getTabLabel(currentTab)}
          </span>
        </>
      )}
    </div>
  );
}

function ProjectHeader({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<string | undefined>();

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
      } catch {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Get current section from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    setCurrentSection(tab || undefined);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-7">
        {/* Add breadcrumb navigation above project header */}
        <SimpleBreadcrumb projectName={project?.name || `Project ${projectId}`} />
        
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
  
  // Initialize navigation loading
  useNavigationLoading();

  useEffect(() => {
    params.then(({ id }) => {
      setProjectId(id);
    });
  }, [params]);

  if (!projectId) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-16"></div>
        <ContentLoading 
          size="lg" 
          message="Loading project..." 
          className="flex-1"
        />
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
      href: `/project/${projectId}?tab=tasks`,
      icon: <FileText className="h-5 w-5" />
    },
    {
      label: "Events",
      href: `/project/${projectId}?tab=events`,
      icon: <Calendar className="h-5 w-5" />
    },
    {
      label: "Members",
      href: `/project/${projectId}?tab=members`, 
      icon: <Users className="h-5 w-5" />
    },
    {
      label: "Files",
      href: `/project/${projectId}?tab=files`,
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