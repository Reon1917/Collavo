import { getProjectById, getTasksByProjectId, getUserById } from '@/lib/data';
import { Task, User } from '@/types';
import { Button } from '@/components/ui/button';

export default async function TasksPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);
  const tasks = await getTasksByProjectId(params.id);

  if (!project) {
    return null; // This will be handled by the layout
  }

  // Group tasks by their deadline date for the calendar view
  const tasksByDate = groupTasksByDate(tasks);
  
  // Get the current month and year for the calendar
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Generate calendar days for the current month
  const calendarDays = generateCalendarDays(currentMonth, currentYear);

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-gray-600">
            {tasks.length} tasks, {tasks.filter(t => t.status === 'completed').length} completed
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Add New Task
        </Button>
      </header>

      {/* Calendar View */}
      <section className="mb-10">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
          
          {/* Calendar grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center font-medium text-sm text-gray-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dateString = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                const dayTasks = dateString ? (tasksByDate[dateString] || []) : [];
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[100px] p-2 border rounded-md ${!day ? 'bg-gray-50' : isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    {day ? (
                      <>
                        <div className={`text-right text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayTasks.slice(0, 3).map(task => (
                            <CalendarTaskItem key={task.id} task={task} />
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Task List */}
      <section>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">All Tasks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <TaskListItem key={task.id} task={task} projectId={params.id} />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No tasks added yet
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function CalendarTaskItem({ task }: { task: Task }) {
  // Determine color based on importance
  const importanceColors = {
    'minor': 'bg-gray-100 text-gray-800',
    'normal': 'bg-blue-100 text-blue-800',
    'major': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800'
  };

  return (
    <div 
      className={`px-2 py-1 rounded text-xs truncate ${importanceColors[task.importance]}`}
      title={task.title}
    >
      {task.title}
    </div>
  );
}

async function TaskListItem({ task, projectId }: { task: Task; projectId: string }) {
  // In a real app, we would use a more efficient way to fetch users
  const assignee = await getUserById(task.assignedTo);
  
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
            <span className="mx-2 text-gray-300">u2022</span>
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

// Helper function to group tasks by their deadline date
function groupTasksByDate(tasks: Task[]) {
  return tasks.reduce((acc, task) => {
    const date = new Date(task.deadline).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
}

// Helper function to generate calendar days for a given month
function generateCalendarDays(month: number, year: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Create array with empty slots for days from previous month
  const days = Array(firstDay).fill(null);
  
  // Add the days of the current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
}
