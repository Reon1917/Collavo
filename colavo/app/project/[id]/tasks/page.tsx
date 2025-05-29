"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { TaskDialog } from '@/components/tasks/task-dialog';

export default function TasksPage({ params }: { params: { id: string } }) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  // Mock empty tasks for now - replace with real data later
  const tasks: never[] = [];

  const handleTaskCreate = () => {
    setIsTaskDialogOpen(false);
    // TODO: Implement task creation when backend is ready
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tasks & Events</h1>
          <p className="text-muted-foreground">
            Manage tasks and schedule events for your project
          </p>
        </div>
        <Button onClick={() => setIsTaskDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No tasks yet</CardTitle>
            <CardDescription>
              Create your first task to get started with project management.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsTaskDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Tasks will be displayed here when backend is implemented */}
          <p className="text-center text-gray-500 py-8">
            Task list will be implemented when backend is ready
          </p>
        </div>
      )}

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSubmit={handleTaskCreate}
        projectId={params.id}
      />
    </div>
  );
}
