"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Task, TaskImportance, TaskStatus } from "@/types";
import { addLocalTask } from "@/lib/client-data";

interface TaskDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
  onTaskAdded?: (task: Task) => void;
}

export function TaskDialog({ projectId, trigger, onTaskAdded }: TaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "user1", // Default to current user for simplicity
    importance: "normal" as TaskImportance,
    status: "pending" as TaskStatus,
    deadline: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask = addLocalTask({
      projectId,
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      importance: formData.importance as TaskImportance,
      status: formData.status as TaskStatus,
      deadline: new Date(formData.deadline).toISOString(),
    });
    
    if (onTaskAdded) {
      onTaskAdded(newTask);
    }
    
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      assignedTo: "user1",
      importance: "normal" as TaskImportance,
      status: "pending" as TaskStatus,
      deadline: new Date().toISOString().split("T")[0],
    });
    
    // Refresh the page to show the new task
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-blue-600 hover:bg-blue-700">Add New Task</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="col-span-3 flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="col-span-3 flex h-20 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="importance" className="text-right text-sm font-medium">
                Importance
              </label>
              <select
                id="importance"
                name="importance"
                className="col-span-3 flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.importance}
                onChange={handleChange}
              >
                <option value="minor">Minor</option>
                <option value="normal">Normal</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="col-span-3 flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="deadline" className="text-right text-sm font-medium">
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                className="col-span-3 flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
