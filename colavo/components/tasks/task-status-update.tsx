"use client";

import { useState } from "react";
import { Task, TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface TaskStatusUpdateProps {
  task: Task;
  currentUserId: string;
  onUpdate?: () => void;
}

export function TaskStatusUpdate({ task, currentUserId, onUpdate }: TaskStatusUpdateProps) {
  const [note, setNote] = useState(task.notes || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isEditing, setIsEditing] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);

  const isAssigned = Array.isArray(task.assignedTo)
    ? task.assignedTo.includes(currentUserId)
    : false;

  if (!isAssigned) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-500">Only assigned team members can update this task</p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call to update task status
      // await updateTaskStatus(task.id, newStatus, note.trim());
      //console.log('Updating task status:', { taskId: task.id, status: newStatus, note: note.trim() });
      
      setStatus(newStatus);
      if (onUpdate) {
        onUpdate();
      }
    } catch  {
      toast.error('Failed to update task status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  const handleNoteSave = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call to update task notes
      // await updateTaskNotes(task.id, note.trim());
      //console.log('Updating task notes:', { taskId: task.id, notes: note.trim() });
      
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch {
      toast.error('Failed to update task status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={status === "backlog" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("backlog")}
          >
            Backlog
          </Button>
          <Button
            variant={status === "todo" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("todo")}
          >
            To Do
          </Button>
          <Button
            variant={status === "in-progress" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("in-progress")}
          >
            In Progress
          </Button>
          <Button
            variant={status === "review" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("review")}
          >
            Review
          </Button>
          <Button
            variant={status === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("completed")}
          >
            Completed
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Notes:</span>
          {isEditing ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleNoteSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
        {isEditing ? (
          <Textarea
            value={note}
            onChange={handleNoteChange}
            placeholder="Add a note about this task..."
            className="min-h-[100px]"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-md min-h-[100px] text-sm">
            {note || <span className="text-gray-500 italic">No notes added yet</span>}
          </div>
        )}
      </div>
    </div>
  );
} 