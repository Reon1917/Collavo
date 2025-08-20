"use client";

import { Badge } from '@/components/ui/badge';
import { CheckSquare, Plus, UserPlus, Edit, Trash2, CheckCircle, Crown, FileIcon, ExternalLink, Eye } from 'lucide-react';
import { CreateTaskForm } from '@/components/project/TasksView/components/forms/CreateTaskForm';
import { Project, Task } from '@/hooks/shared/useProjectData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatInitials } from '@/utils/format';
import { ProjectEditDialog } from '../dialogs/ProjectEditDialog';
import { ProjectDeleteDialog } from '../dialogs/ProjectDeleteDialog';
import { ViewTabs } from '@/components/project/OverviewView/components/ViewTabs';
import { TimelineView } from '@/components/project/OverviewView/components/TimelineView';
import { GraphView } from '@/components/project/OverviewView/components/GraphView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface OverviewTabProps {
  project: Project;
  tasks: Task[];
  events: any[];
  files: any[];
  permissions: {
    canAddMembers: boolean;
    canCreateTasks: boolean;
    canManagePermissions: boolean;
    isLeader: boolean;
  };
  onRefresh: () => void;
  onTabChange: (tab: string) => void;
}

export function OverviewTab({ project, tasks, events, files, permissions, onRefresh, onTabChange }: OverviewTabProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'timeline' | 'graph'>('overview');

  // Format user permissions for display (excluding role)
  const getUserPermissions = () => {
    const permissionsList: string[] = [];
    
    // Add actual permissions from the database (no role label)
    if (project.userPermissions && project.userPermissions.length > 0) {
      const formattedPermissions = project.userPermissions.map(permission => {
        // Convert camelCase to readable format
        switch (permission) {
          case 'createTask': return 'Create Tasks';
          case 'handleTask': return 'Manage Tasks';
          case 'updateTask': return 'Update Tasks';
          case 'handleEvent': return 'Manage Events';
          case 'handleFile': return 'Manage Files';
          case 'addMember': return 'Add Members';
          case 'createEvent': return 'Create Events';
          case 'viewFiles': return 'View Files';
          case 'viewTasks': return 'View Tasks';
          case 'editProject': return 'Edit Project';
          case 'deleteProject': return 'Delete Project';
          case 'managePermissions': return 'Manage Permissions';
          default: 
            // Fallback: convert camelCase to Title Case
            return permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }
      });
      
      permissionsList.push(...formattedPermissions);
    } else {
      // Fallback for members with no specific permissions
      if (!permissions.isLeader) {
        permissionsList.push('View Project');
      }
    }
    
    return permissionsList;
  };

  const userPermissions = getUserPermissions();

  // Calculate task metrics
  const totalSubTasks = tasks.reduce((total, task) => total + task.subTasks.length, 0);
  const subTasksInProgress = tasks.reduce((total, task) => {
    return total + task.subTasks.filter(st => st.status === 'in_progress').length;
  }, 0);
  const subTasksCompleted = tasks.reduce((total, task) => {
    return total + task.subTasks.filter(st => st.status === 'completed').length;
  }, 0);
  


  // Count only upcoming events (future events)
  const now = new Date();
  const upcomingEventsCount = events.filter(event => new Date(event.datetime) > now).length;

  return (
    <div className="space-y-6">
      {/* View Tabs at the top */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {selectedView === 'timeline' ? 'Timeline View' : selectedView === 'graph' ? 'Analytics' : 'Project View'}
        </h2>
        <ViewTabs value={selectedView} onChange={setSelectedView} />
      </div>

      {/* Animated Content Based on Selected View */}
      <AnimatePresence mode="wait">
        {selectedView === 'timeline' ? (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <TimelineView 
              tasks={tasks.map(task => ({
                id: task.id,
                projectId: project.id,
                title: task.title,
                description: task.description || '',
                status: 'todo' as const,
                importance: task.importanceLevel as 'low' | 'normal' | 'high' | 'critical',
                dueDate: task.deadline ? new Date(task.deadline) : null,
                startDate: null,
                assignedTo: [],
                createdBy: task.createdBy,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt),
                completedAt: null,
                estimatedHours: null,
                actualHours: null,
                tags: [],
                dependencies: [],
                notes: '',
              }))}
              events={events.map(event => ({
                id: event.id,
                projectId: project.id,
                title: event.title,
                description: event.description || '',
                type: 'other' as const,
                startDate: new Date(event.datetime),
                endDate: new Date(event.datetime),
                isAllDay: false,
                location: event.location,
                attendees: [],
                createdBy: event.createdBy,
                createdAt: new Date(event.createdAt),
                updatedAt: new Date(event.updatedAt),
                tags: [],
                isRecurring: false,
                recurrenceRule: null,
              }))}
            />
          </motion.div>
        ) : selectedView === 'graph' ? (
          <motion.div
            key="graph"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <GraphView project={project} tasks={tasks} />
          </motion.div>
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
        <>
          {/* Updated Overview Content */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{project.members.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{totalSubTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Sub-tasks</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{subTasksInProgress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sub-tasks in Progress</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{subTasksCompleted}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sub-tasks Completed</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{upcomingEventsCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
                {tasks.length > 0 && (
                  <button 
                    onClick={() => onTabChange('tasks')}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    View all {tasks.length} tasks →
                  </button>
                )}
              </div>
              
              <div className="min-h-[400px]">
                {tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.slice(0, 2).map((task) => (
                      <TaskPreviewCard key={task.id} task={task} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {permissions.canCreateTasks 
                        ? "Get started by creating your first task."
                        : "Tasks will appear here once they're created."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Files</h2>
                {files.length > 0 && (
                  <button 
                    onClick={() => onTabChange('files')}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    View all {files.length} files →
                  </button>
                )}
              </div>
              
              <div className="min-h-[400px]">
                {files.length > 0 ? (
                  <div className="space-y-4">
                    {files.slice(0, 3).map((file) => (
                      <FilePreviewCard key={file.id} file={file} projectId={project.id} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Upload files or add links to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div 
                className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer"
                onClick={() => setIsPermissionsDialogOpen(true)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Access</h3>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                  {userPermissions.length > 0 ? (
                    userPermissions.slice(0, 4).map((permission, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {permission}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No specific permissions assigned
                    </p>
                  )}
                  {userPermissions.length > 4 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      +{userPermissions.length - 4} more permissions
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Team</h3>
                <div className="space-y-2">
                  {project.members && project.members.length > 0 ? (
                    project.members.slice(0, 4).map((member) => (
                      <div key={member.id || member.userId} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={(member as any).userImage || ''} alt={(member as any).userName || 'User'} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {formatInitials((member as any).userName || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
                            {(member as any).userName || 'Unknown User'}
                            {(member.userId === project.currentUserId) && (
                              <span className="text-xs text-gray-500 ml-1">(You)</span>
                            )}
                          </span>
                        </div>
                        {(member.role === 'leader' || project.leaderId === member.userId) && (
                          <Crown className="h-3 w-3 text-primary" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No team members found
                    </p>
                  )}
                  {project.members && project.members.length > 4 && (
                    <button 
                      onClick={() => onTabChange('members')}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      +{project.members.length - 4} more members
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {permissions.isLeader && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Management</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Leader actions</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {permissions.canCreateTasks && (
                  <CreateTaskForm 
                    projectId={project.id} 
                    onTaskCreated={onRefresh}
                    members={project.members}
                    trigger={
                      <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-center">
                        <Plus className="h-6 w-6 mb-2 text-primary" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Create Task</span>
                      </div>
                    }
                  />
                )}
                
                {permissions.canAddMembers && (
                  <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-center"
                       onClick={() => onTabChange('members')}>
                    <UserPlus className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Add Member</span>
                  </div>
                )}
                
                <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-center"
                     onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-6 w-6 mb-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Edit Project</span>
                </div>
                
                <div className="flex flex-col items-center p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors text-center"
                     onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-6 w-6 mb-2 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Delete Project</span>
                </div>
              </div>
            </div>
          )}
        </>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {userPermissions.length > 0 ? (
              userPermissions.map((permission, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {permission}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No specific permissions assigned
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ProjectEditDialog 
        project={project}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onRefresh={onRefresh}
      />

      <ProjectDeleteDialog 
        project={project}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}

function TaskPreviewCard({ task, project }: { task: Task; project: Project }) {
  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">{task.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Created by {task.creatorName}</p>
        </div>
        <Badge 
          variant="outline" 
          className={`text-xs ml-2 ${task.importanceLevel === 'critical' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : task.importanceLevel === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' : task.importanceLevel === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'}`}
        >
          {task.importanceLevel}
        </Badge>
      </div>
      
      {task.subTasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round((task.subTasks.filter(st => st.status === 'completed').length / task.subTasks.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${(task.subTasks.filter(st => st.status === 'completed').length / task.subTasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {task.subTasks.length > 0 && (
        <div className="space-y-1">
          {task.subTasks.slice(0, 2).map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${
                subtask.status === 'completed' ? 'bg-green-500' :
                subtask.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{subtask.title}</span>
              {subtask.assignedUserName && (
                <span className="text-gray-500 dark:text-gray-500 text-xs">
                  {subtask.assignedId === project.currentUserId ? 'You' : subtask.assignedUserName}
                </span>
              )}
            </div>
          ))}
          {task.subTasks.length > 2 && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              +{task.subTasks.length - 2} more subtasks
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FilePreviewCard({ file, projectId }: { file: any; projectId: string }) {
  const isLink = !file.uploadThingId;
  const fileSize = file.size ? `${Math.round(file.size / 1024)}KB` : null;
  
  // Permission validation for file/link access
  const handleClick = useCallback(async () => {
    try {
      // Validate current permissions before allowing access
      const response = await fetch(`/api/projects/${projectId}/overview`);
      if (!response.ok) {
        toast.error('Permission denied');
        return;
      }
      
      const data = await response.json();
      const currentPermissions = data.project?.userPermissions || [];
      const currentIsLeader = data.project?.isLeader || false;
      
      // Check if user still has permission to view files
      if (!currentIsLeader && !currentPermissions.includes('viewFiles')) {
        toast.error(`You no longer have permission to access this ${isLink ? 'link' : 'file'}`);
        return;
      }
      
      // If permission check passes, open the file/link
      window.open(file.url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to verify permissions');
    }
  }, [file.url, projectId, isLink]);
  
  return (
    <div 
      className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer group"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {isLink ? (
              <ExternalLink className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <FileIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{file.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Added by {file.addedByName} • {new Date(file.addedAt).toLocaleDateString()}
            </p>
            {fileSize && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{fileSize}</p>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs ml-2">
          {isLink ? 'Link' : 'File'}
        </Badge>
      </div>
      
      {file.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {file.description}
        </p>
      )}
    </div>
  );
}