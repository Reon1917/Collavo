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

interface Task {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  importance?: string;
  deadline?: string;
  assignedTo?: string[];
}

interface TaskItemProps {
  task: Task; // Using proper interface instead of any
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  // Mock task data structure for demo
  const mockTask = {
    id: "1",
    title: "Sample Task",
    description: "This is a sample task description",
    status: "pending",
    importance: "normal",
    deadline: new Date().toISOString(),
    assignedTo: [],
  };

  // Use mockTask for now since task prop might be empty
  const displayTask = { ...mockTask, ...task };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{displayTask.title}</h3>
              <Badge className={getStatusColor(displayTask.status)}>
                {displayTask.status}
              </Badge>
              <Badge className={getImportanceColor(displayTask.importance)}>
                {displayTask.importance}
              </Badge>
            </div>
            
            {displayTask.description && (
              <p className="text-gray-600 mb-3">{displayTask.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(displayTask.deadline).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>
                  {displayTask.assignedTo.length > 0 
                    ? `${displayTask.assignedTo.length} assigned` 
                    : "Unassigned"}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Created today</span>
              </div>
            </div>
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
                className="text-red-600"
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
