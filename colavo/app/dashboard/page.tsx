"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardNavbar } from '@/components/ui/dashboard-navbar';
import { PlusCircle, FolderOpen, UserPlus, Calendar, Crown, User} from 'lucide-react';
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
                  <h3 className="text-2xl font-semibold mb-3 text-foreground">No projects yet</h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Take the lead and create your first project. Organize your team, set goals, and bring your ideas to life.
                  </p>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 h-auto rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium">
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
                  <h3 className="text-2xl font-semibold mb-3 text-foreground">No memberships yet</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You haven&apos;t been added to any projects as a member. Create a project or wait for team invitations to get started.
                  </p>
                </div>
              </div>
            )}
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
      <Card className="bg-card border-border shadow-md hover:shadow-lg transition-all duration-200 hover:border-primary/50 backdrop-blur-sm group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <Badge 
              variant={isLeader ? "default" : "secondary"}
              className={isLeader 
                ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
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
            <CardDescription className="text-muted-foreground line-clamp-2">
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
            <div className="text-xs text-muted-foreground/70">
              Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
