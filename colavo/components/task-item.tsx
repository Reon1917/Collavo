"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Task, User } from "@/types";
import { Button } from "@/components/ui/button";
import { deleteLocalTask } from "@/lib/client-data";
import { Trash2 } from "lucide-react";

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
      <div className="flex items-center">
        <div className={`w-1 h-16 rounded-full mr-4 ${importanceColors[task.importance]}`} />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-500 mb-1">{task.description}</p>
          <div className="flex items-center">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-xs text-gray-500">
              Due {new Date(task.deadline).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Display multiple assignees */}
          <div className="flex -space-x-2 mr-2">
            {displayAssignees.slice(0, 3).map((user, index) => (
              <div 
                key={user.id}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white"
                title={user.name}
                style={{ zIndex: 10 - index }}
              >
                {user.name.charAt(0)}
              </div>
            ))}
            {displayAssignees.length > 3 && (
              <div 
                className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium border-2 border-white"
                title={`${displayAssignees.length - 3} more members`}
                style={{ zIndex: 7 }}
              >
                +{displayAssignees.length - 3}
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete task</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
