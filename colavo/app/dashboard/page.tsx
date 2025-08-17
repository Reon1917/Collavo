"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardNavbar } from '@/components/ui/dashboard-navbar';
import { PlusCircle, File, Users, FolderOpen, UserPlus, Calendar, Crown, User} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ContentLoading } from '@/components/ui/content-loading';

interface Project {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  leaderId: string;
  role?: string;
}

interface ProjectsData {
  ledProjects: Project[];
  memberProjects: Project[];
  total: number;
}

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [projectsData, setProjectsData] = useState<ProjectsData>({ ledProjects: [], memberProjects: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects data from API
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in to view your projects');
          return;
        }
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjectsData(data);
    } catch {
      toast.error('Failed to load projects');
      setProjectsData({ ledProjects: [], memberProjects: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && session?.user) {
      fetchProjects();
    } else if (!isPending && !session) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, [session, isPending]);

  // Loading state
  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="container mx-auto px-4 py-8">
          <ContentLoading 
            size="lg" 
            message="Loading your dashboard..." 
            className="min-h-[60vh]"
          />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session?.user) {
    return null; // Will redirect
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      {/* Use the new DashboardNavbar for a more minimal design */}
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to Collavo, {user.name}!</p>
          </div>
        </header>

        <div className="space-y-12">
          {/* Projects you lead */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Projects You Lead</h2>
              <Badge variant="outline" className="text-sm">
                {projectsData.ledProjects.length} project{projectsData.ledProjects.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {projectsData.ledProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsData.ledProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    role="leader"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl p-12 text-center border border-border shadow-md backdrop-blur-sm">
                <div className="max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6 shadow-lg">
                    <FolderOpen className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-card-foreground">No projects yet</h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Take the lead and create your first project. Organize your team, set goals, and bring your ideas to life.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-[#006666] dark:bg-primary dark:hover:bg-[#006666] text-foreground px-8 py-3 h-auto rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium" 
                    asChild
                  >
                    <Link href="/project/new">
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Create Your First Project
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Projects you're a member of */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Projects You&apos;re In</h2>
              <Badge variant="outline" className="text-sm">
                {projectsData.memberProjects.length} project{projectsData.memberProjects.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {projectsData.memberProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsData.memberProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    role="member"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl p-12 text-center border border-border shadow-md backdrop-blur-sm">
                <div className="max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6 shadow-lg">
                    <UserPlus className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-card-foreground">No memberships yet</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You haven&apos;t been added to any projects as a member. Create a project or wait for team invitations to get started.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Quick Access */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickAccessCard 
                title="Create Project" 
                description="Start a new project and invite team members"
                icon={<PlusCircle className="h-8 w-8 text-primary dark:text-secondary" />}
                href="/project/new"
              />
              <QuickAccessCard 
                title="Manage Files" 
                description="Upload and organize your project files"
                icon={<File className="h-8 w-8 text-secondary dark:text-secondary" />}
                href="/dashboard"
              />
              <QuickAccessCard 
                title="Team Collaboration" 
                description="Coordinate with your team members"
                icon={<Users className="h-8 w-8 text-primary dark:text-secondary" />}
                href="/dashboard"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ 
  project, 
  role 
}: { 
  project: Project; 
  role: 'leader' | 'member';
}) {
  const isLeader = role === 'leader';
  
  return (
    <Link href={`/project/${project.id}`}>
      <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:border-secondary/30 backdrop-blur-sm group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <Badge 
              variant={isLeader ? "default" : "secondary"}
              className={isLeader 
                ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
                : "bg-muted text-muted-foreground"
              }
            >
              {isLeader ? (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  Leader
                </>
              ) : (
                <>
                  <User className="h-3 w-3 mr-1" />
                  Member
                </>
              )}
            </Badge>
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {project.deadline && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickAccessCard({ 
  title, 
  description, 
  icon, 
  href 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-card p-6 rounded-xl border border-border shadow-md hover:shadow-lg transition-all duration-200 hover:border-secondary/30 backdrop-blur-sm group">
        <div className="mb-4 group-hover:scale-110 transition-transform duration-200">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
