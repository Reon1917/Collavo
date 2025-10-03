"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle, Clock, AlertCircle, ChevronDown, ChevronRight, ListTodo, X, FolderKanban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SubTaskSummary {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  assignedId: string | null;
}

interface MainTaskSummary {
  id: string;
  title: string;
  description: string | null;
  importanceLevel: string;
  deadline: string | null;
  subTasks: SubTaskSummary[];
}

interface ProjectTasksSummary {
  projectId: string;
  projectName: string;
  projectDeadline: string | null;
  mainTasks: MainTaskSummary[];
}

interface TasksSummaryData {
  projects: ProjectTasksSummary[];
  totalTasks: number;
  totalSubTasks: number;
  completedSubTasks: number;
  overdueSubTasks: number;
}

export function TasksSummary(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<TasksSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedMainTasks, setExpandedMainTasks] = useState<Set<string>>(new Set());
  const [displayedProjects, setDisplayedProjects] = useState<number>(3);

  const fetchTasksSummary = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard/tasks-summary', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks summary');
      }

      const result = await response.json() as TasksSummaryData;
      setData(result);
    } catch (error) {
      console.error('Error fetching tasks summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && !data) {
      fetchTasksSummary();
    }
  }, [open, data]);

  const toggleProject = (projectId: string): void => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const toggleMainTask = (mainTaskId: string): void => {
    setExpandedMainTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mainTaskId)) {
        newSet.delete(mainTaskId);
      } else {
        newSet.add(mainTaskId);
      }
      return newSet;
    });
  };

  const loadMoreProjects = (): void => {
    setDisplayedProjects((prev) => prev + 3);
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getImportanceBadgeColor = (importance: string): string => {
    switch (importance) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const isOverdue = (deadline: string | null): boolean => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const renderContent = (): JSX.Element => {
    if (isLoading) {
      return (
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      );
    }

    if (!data || data.projects.length === 0) {
      return (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
            <ListTodo className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">No tasks assigned yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Tasks you&apos;re assigned will appear here</p>
        </div>
      );
    }

    const visibleProjects = data.projects.slice(0, displayedProjects);
    const hasMoreProjects = displayedProjects < data.projects.length;

    return (
      <div className="space-y-4">
        {/* Stats Summary - Compact Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="text-xl font-bold text-foreground">{data.totalSubTasks}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Total</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{data.completedSubTasks}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Done</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/5 border border-red-500/10">
            <div className="text-xl font-bold text-red-600 dark:text-red-400">{data.overdueSubTasks}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Overdue</div>
          </div>
        </div>

        {/* Projects List */}
        <ScrollArea className="h-[420px]">
          <div className="space-y-2 pr-3">
            {visibleProjects.map((project) => (
              <div key={project.projectId} className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Project Header */}
                <button
                  onClick={() => toggleProject(project.projectId)}
                  className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 text-left min-w-0">
                    {expandedProjects.has(project.projectId) ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <FolderKanban className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="font-semibold text-sm text-foreground truncate">
                      {project.projectName}
                    </span>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0 text-[10px] px-2 py-0.5">
                    {project.mainTasks.reduce((acc, mt) => acc + mt.subTasks.length, 0)}
                  </Badge>
                </button>

                {/* Project Content */}
                {expandedProjects.has(project.projectId) && (
                  <div className="px-3 pb-2 space-y-1.5 bg-muted/20">
                    {project.mainTasks.map((mainTask) => (
                      <div key={mainTask.id} className="rounded-md border border-border/40 bg-background overflow-hidden">
                        {/* Main Task Header */}
                        <button
                          onClick={() => toggleMainTask(mainTask.id)}
                          className="w-full px-2.5 py-2 flex items-center justify-between hover:bg-accent/20 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 text-left min-w-0">
                            {expandedMainTasks.has(mainTask.id) ? (
                              <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="text-xs font-medium text-foreground truncate">
                              {mainTask.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <Badge className={cn("text-[10px] px-1.5 py-0.5 font-medium", getImportanceBadgeColor(mainTask.importanceLevel))}>
                              {mainTask.importanceLevel}
                            </Badge>
                          </div>
                        </button>

                        {/* Sub Tasks */}
                        {expandedMainTasks.has(mainTask.id) && (
                          <div className="px-2 pb-2 space-y-1 bg-muted/10">
                            {mainTask.subTasks.map((subTask) => (
                              <Link
                                key={subTask.id}
                                href={`/project/${project.projectId}/tasks`}
                                onClick={() => setOpen(false)}
                                className="block px-2.5 py-2 rounded-md bg-background border border-border/40 hover:border-primary/40 hover:bg-accent/10 transition-all group"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex-shrink-0">
                                    {getStatusIcon(subTask.status)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                                      {subTask.title}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Badge className={cn("text-[10px] px-1.5 py-0 font-medium", getStatusBadgeColor(subTask.status))}>
                                        {subTask.status === 'in_progress' ? 'in progress' : subTask.status}
                                      </Badge>
                                      {subTask.deadline && (
                                        <span className={cn(
                                          "text-[10px] flex items-center gap-1",
                                          isOverdue(subTask.deadline) && subTask.status !== 'completed'
                                            ? "text-red-600 dark:text-red-400 font-semibold"
                                            : "text-muted-foreground"
                                        )}>
                                          <Clock className="h-2.5 w-2.5" />
                                          {formatDistanceToNow(new Date(subTask.deadline), { addSuffix: true })}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Load More Button */}
            {hasMoreProjects && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMoreProjects}
                className="w-full mt-2 text-xs"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Load {Math.min(3, data.projects.length - displayedProjects)} More
              </Button>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const getTotalTasksCount = (): number => {
    return data?.totalSubTasks || 0;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="relative gap-2 shadow-sm hover:shadow-md transition-all border-border/60"
        >
          <ListTodo className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">My Tasks</span>
          {data && getTotalTasksCount() > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px] font-bold shadow-sm"
            >
              {getTotalTasksCount()}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[95vw] sm:w-[520px] p-0 shadow-xl border-border/60"
        align="end"
        sideOffset={12}
      >
        <div className="px-4 py-3 border-b border-border/60 bg-gradient-to-r from-card to-card/80">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            My Tasks Summary
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tasks assigned to you across all projects</p>
        </div>
        <div className="p-4">
          {renderContent()}
        </div>
      </PopoverContent>
    </Popover>
  );
}
