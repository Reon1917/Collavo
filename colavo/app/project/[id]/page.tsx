import { getProjectById, getTasksByProjectId, getResourcesByProjectId, getUserById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Task, User } from '@/types';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  const project = await getProjectById(id);
  const tasks = await getTasksByProjectId(id);
  const resources = await getResourcesByProjectId(id);

  if (!project) {
    return null; // This will be handled by the layout
  }

  // Calculate project statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Get upcoming tasks (sorted by deadline)
  const upcomingTasks = [...tasks]
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  // Calculate days until deadline
  const deadline = new Date(project.deadline);
  const today = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-600">{project.description}</p>
      </header>

      {/* Project stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Progress" 
          value={`${progressPercentage}%`}
          description={`${completedTasks} of ${totalTasks} tasks completed`}
          color="bg-blue-500"
        />
        <StatCard 
          title="Deadline" 
          value={daysRemaining < 0 ? 'Overdue' : daysRemaining === 0 ? 'Today' : `${daysRemaining} days`}
          description={deadline.toLocaleDateString()}
          color={daysRemaining < 0 ? 'bg-red-500' : daysRemaining <= 3 ? 'bg-yellow-500' : 'bg-green-500'}
        />
        <StatCard 
          title="Team Size" 
          value={project.members.length.toString()}
          description={project.members.length === 1 ? 'member' : 'members'}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming tasks */}
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
            <Button variant="outline" size="sm" asChild>
              <a href={`/project/${id}/tasks`}>View All</a>
            </Button>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No upcoming tasks
              </div>
            )}
          </div>
        </section>

        {/* Recent files */}
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Files</h2>
            <Button variant="outline" size="sm" asChild>
              <a href={`/project/${id}/files`}>View All</a>
            </Button>
          </div>
          <div className="divide-y divide-gray-200">
            {resources.length > 0 ? (
              resources.slice(0, 3).map(resource => (
                <div key={resource.id} className="p-4 hover:bg-gray-50">
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                      <FileIcon />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{resource.name}</h3>
                      <p className="text-sm text-gray-500">
                        Added {new Date(resource.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </a>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No files added yet
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

async function TaskItem({ task }: { task: Task }) {
  // Handle multiple assignees
  let assignee: User | undefined;
  
  // Check if assignedTo is an array (new format) or string (old format)
  if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
    // Get the first assignee for display in the overview
    assignee = await getUserById(task.assignedTo[0]);
  } else if (typeof task.assignedTo === 'string') {
    // Handle legacy format
    assignee = await getUserById(task.assignedTo);
  }
  
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
        {assignee && (
          <div 
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium"
            title={assignee.name}
          >
            {assignee.name.charAt(0)}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  description, 
  color 
}: { 
  title: string; 
  value: string; 
  description: string; 
  color: string 
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className={`h-2 ${color}`} />
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}
