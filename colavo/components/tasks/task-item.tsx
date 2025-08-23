"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Database schema types for tasks
interface Task {
  id: string;
  title: string;
  description: string | null;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string;
  creatorEmail: string;
  subTasks: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  note: string | null;
  deadline: string | null;
  assignedId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedUserName: string | null;
  assignedUserEmail: string | null;
}

interface TaskItemProps {
  task: Task;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  /*
  const _getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };
*/
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical":
        return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
      case "high":
        return "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4";
      case "medium":
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };  

  const getTaskProgress = () => {
    if (!task.subTasks || task.subTasks.length === 0) return 0;
    const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
    return Math.round((completedSubTasks / task.subTasks.length) * 100);
  };

  const getAssignedCount = () => {
    if (!task.subTasks || task.subTasks.length === 0) return 0;
    return task.subTasks.filter(st => st.assignedId).length;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-foreground">{task.title}</h3>
              <Badge className={getImportanceColor(task.importanceLevel)}>
                {task.importanceLevel}
              </Badge>
              {task.subTasks && task.subTasks.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {getTaskProgress()}% Complete
                </Badge>
              )}
            </div>
            
            {task.description && (
              <p className="text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>
                  {getAssignedCount() > 0 
                    ? `${getAssignedCount()} assigned` 
                    : "Unassigned"}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  Created {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {task.subTasks && task.subTasks.length > 0 && (
              <div className="mt-3 text-xs text-muted-foreground">
                {task.subTasks.length} subtask{task.subTasks.length !== 1 ? 's' : ''} • 
                {task.subTasks.filter(st => st.status === 'completed').length} completed
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onUpdate}>
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive"
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
