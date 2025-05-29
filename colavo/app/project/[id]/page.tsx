import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // TODO: Replace with actual API calls
  // const project = await fetch(`/api/projects/${id}`).then(res => res.json());
  // const tasks = await fetch(`/api/projects/${id}/tasks`).then(res => res.json());
  // const files = await fetch(`/api/projects/${id}/files`).then(res => res.json());

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Overview</h1>
        <p className="text-gray-600">Monitor progress, tasks, and team collaboration</p>
      </header>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Progress" 
          value="0%"
          description="0 of 0 tasks completed"
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatCard 
          title="Tasks" 
          value="0"
          description="Total tasks"
          icon={<FileText className="h-5 w-5 text-blue-600" />}
        />
        <StatCard 
          title="Team Size" 
          value="1"
          description="Active members"
          icon={<Users className="h-5 w-5 text-purple-600" />}
        />
        <StatCard 
          title="Deadline" 
          value="Not set"
          description="Project deadline"
          icon={<Calendar className="h-5 w-5 text-orange-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl">Recent Tasks</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href={`/project/${id}/tasks`}>View All</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-4">Create your first task to get started</p>
              <Button asChild>
                <a href={`/project/${id}/tasks`}>Create Task</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl">Recent Files</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href={`/project/${id}/files`}>View All</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No files yet</h3>
              <p className="text-gray-500 mb-4">Upload files or add links to get started</p>
              <Button asChild>
                <a href={`/project/${id}/files`}>Add Files</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TODO: Implement project management features */}
      {/* 
      Future features:
      - Real-time project statistics
      - Task management integration
      - File management integration
      - Team member activity feed
      - Project timeline and milestones
      - Collaboration tools
      */}
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
          {icon}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
