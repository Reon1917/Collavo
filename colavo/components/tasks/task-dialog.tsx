"use client";

import { useState, useEffect } from "react";
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
import { Task, TaskImportance, TaskStatus, User } from "@/types";
import { addLocalTask } from "@/lib/client-data";
import { getProjectById, getCurrentUser, getUserById } from "@/lib/data";

interface TaskDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
  onTaskAdded?: (task: Task) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  initialData?: Partial<Task>;
  isEditMode?: boolean;
}

export function TaskDialog({ projectId, trigger, onTaskAdded, open: controlledOpen, setOpen: setControlledOpen, initialData, isEditMode }: TaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : open;
  const setDialogOpen = isControlled ? setControlledOpen! : setOpen;
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    assignedTo: (initialData?.assignedTo as string[]) || [],
    importance: (initialData?.importance as TaskImportance) || "normal",
    status: (initialData?.status as TaskStatus) || "pending",
    deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        assignedTo: (initialData.assignedTo as string[]) || [],
        importance: (initialData.importance as TaskImportance) || "normal",
        status: (initialData.status as TaskStatus) || "pending",
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      });
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        setIsLoading(true);
        const project = await getProjectById(projectId);
        if (!project) return;
        const members = project.members.map(member => member.userId);
        if (!members.includes(project.leader)) {
          members.push(project.leader);
        }
        const memberDetails = await Promise.all(
          members.map(async (userId) => {
            const user = await getUserById(userId);
            return user;
          })
        );
        setProjectMembers(memberDetails.filter((user): user is User => user !== undefined));
      } catch (error) {
        console.error('Error fetching project members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (dialogOpen) {
      fetchProjectMembers();
    }
  }, [projectId, dialogOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.assignedTo.length === 0) {
      alert("Please assign at least one member to the task");
      return;
    }
    if (isEditMode && initialData) {
      if (onTaskAdded) onTaskAdded({
        ...formData,
        id: initialData.id!,
        projectId: initialData.projectId!,
        createdAt: initialData.createdAt!,
        type: 'task',
      });
      setDialogOpen(false);
      return;
    }
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
    setDialogOpen(false);
    setFormData({
      title: "",
      description: "",
      assignedTo: [],
      importance: "normal" as TaskImportance,
      status: "pending" as TaskStatus,
      deadline: new Date().toISOString().split("T")[0],
    });
    router.refresh();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || <Button>Add Task</Button>}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
              Assign To
            </label>
            <div className="mt-1 space-y-2">
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading members...</div>
              ) : (
                projectMembers.map((member) => (
                  <div key={member.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`member-${member.id}`}
                      checked={formData.assignedTo.includes(member.id)}
                      onChange={(e) => {
                        const newAssignedTo = e.target.checked
                          ? [...formData.assignedTo, member.id]
                          : formData.assignedTo.filter(id => id !== member.id);
                        setFormData({ ...formData, assignedTo: newAssignedTo });
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`member-${member.id}`} className="ml-2 text-sm text-gray-700">
                      {member.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label htmlFor="importance" className="block text-sm font-medium text-gray-700">
              Importance
            </label>
            <select
              id="importance"
              value={formData.importance}
              onChange={(e) => setFormData({ ...formData, importance: e.target.value as TaskImportance })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="minor">Minor</option>
              <option value="normal">Normal</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? "Save Changes" : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
