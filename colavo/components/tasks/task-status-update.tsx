"use client";

import { useState } from "react";
import { Task, TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateLocalTask } from "@/lib/client-data";

interface TaskStatusUpdateProps {
  task: Task;
  currentUserId: string;
  onUpdate: () => void;
}

export function TaskStatusUpdate({ task, currentUserId, onUpdate }: TaskStatusUpdateProps) {
  const [note, setNote] = useState(task.note || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isEditing, setIsEditing] = useState(false);

  const isAssigned = Array.isArray(task.assignedTo)
    ? task.assignedTo.includes(currentUserId)
    : task.assignedTo === currentUserId;

  if (!isAssigned) {
    return null;
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateLocalTask(task.id, {
        ...task,
        status: newStatus,
        note: note.trim(),
      });
      setStatus(newStatus);
      onUpdate();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  const handleNoteSave = async () => {
    try {
      await updateLocalTask(task.id, {
        ...task,
        note: note.trim(),
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating task note:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <div className="flex gap-2">
          <Button
            variant={status === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("pending")}
          >
            Pending
          </Button>
          <Button
            variant={status === "in-progress" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("in-progress")}
          >
            In Progress
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
            <Button size="sm" onClick={handleNoteSave}>
              Save
            </Button>
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
          <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
            {note || "No notes added yet"}
          </div>
        )}
      </div>
    </div>
  );
} 