"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Task, User } from "@/types";
import { Button } from "@/components/ui/button";
import { deleteLocalTask } from "@/lib/client-data";
import { Trash2 } from "lucide-react";
import { TaskStatusUpdate } from "./task-status-update";
import { getCurrentUser } from "@/lib/data";

interface TaskItemProps {
  task: Task;
  projectId: string;
  assignee?: User;
  assignees?: User[];
  onDelete?: () => void;
}

export function TaskItem({ task, projectId, assignee, assignees, onDelete }: TaskItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchCurrentUser();
  }, []);

  // Determine status color
  const statusColors = {
    'pending': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800'
  };
  
  // Determine importance color
  const importanceColors = {
    'minor': 'border-gray-300',
    'normal': 'border-blue-300',
    'major': 'border-orange-300',
    'critical': 'border-red-300'
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteLocalTask(task.id);
    
    // Call the onDelete callback if provided
    if (onDelete) {
      onDelete();
    } else {
      // Fall back to router.refresh if no callback provided
      router.refresh();
    }
  };

  // Get assignees to display
  const displayAssignees = assignees || (assignee ? [assignee] : []);

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-500">{task.description}</p>
          
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              task.importance === "critical" ? "bg-red-100 text-red-800" :
              task.importance === "major" ? "bg-orange-100 text-orange-800" :
              task.importance === "normal" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {task.importance.charAt(0).toUpperCase() + task.importance.slice(1)}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">
              Due {new Date(task.deadline).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Assigned to:</span>
            <div className="flex -space-x-2">
              {displayAssignees.map((assignee) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                  title={assignee.name}
                >
                  {assignee.name.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            task.status === "completed" ? "bg-green-100 text-green-800" :
            task.status === "in-progress" ? "bg-blue-100 text-blue-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {currentUserId && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <TaskStatusUpdate
            task={task}
            currentUserId={currentUserId}
            onUpdate={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
