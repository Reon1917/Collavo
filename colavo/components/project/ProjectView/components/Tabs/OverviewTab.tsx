"use client";

import { Badge } from '@/components/ui/badge';
import { CheckSquare, Plus, UserPlus, Edit, Trash2, CheckCircle, Crown } from 'lucide-react';
import { CreateTaskForm } from '@/components/project/TasksView';
import { Project, Task } from '@/hooks/shared/useProjectData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatInitials } from '@/utils/format';
import { ProjectEditDialog } from '../dialogs/ProjectEditDialog';
import { ProjectDeleteDialog } from '../dialogs/ProjectDeleteDialog';
import { useState } from 'react';

interface OverviewTabProps {
  project: Project;
  tasks: Task[];
  permissions: {
    canAddMembers: boolean;
    canCreateTasks: boolean;
    canManagePermissions: boolean;
    isLeader: boolean;
  };
  onRefresh: () => void;
  onTabChange: (tab: string) => void;
}

export function OverviewTab({ project, tasks, permissions, onRefresh, onTabChange }: OverviewTabProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{tasks.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
        </div>
        <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{project.members.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
        </div>
        <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{project.userPermissions.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Your Permissions</div>
        </div>
        <div className="text-center p-4 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg">
          <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {tasks.filter(t => t.subTasks.some(st => st.status === 'completed')).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Tasks in Progress</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
            {tasks.length > 0 && (
              <button 
                onClick={() => onTabChange('tasks')}
                className="text-sm text-[#008080] hover:text-[#006666] font-medium flex items-center gap-1"
              >
                View all {tasks.length} tasks →
              </button>
            )}
          </div>
          
          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tasks.slice(0, 6).map((task) => (
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

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Your Access</h3>
            <div className="space-y-2">
              {project.userPermissions.length > 0 ? (
                project.userPermissions.slice(0, 4).map((permission) => (
                  <div key={permission} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No specific permissions assigned
                </p>
              )}
              {project.userPermissions.length > 4 && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  +{project.userPermissions.length - 4} more permissions
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Team</h3>
            <div className="space-y-2">
              {project.members.slice(0, 4).map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.userImage || ''} alt={member.userName} />
                    <AvatarFallback className="bg-[#008080] text-white text-xs">
                      {formatInitials(member.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
                      {member.userName}
                      {member.userId === project.currentUserId && (
                        <span className="text-xs text-gray-500 ml-1">(You)</span>
                      )}
                    </span>
                  </div>
                  {member.role === 'leader' && (
                    <Crown className="h-3 w-3 text-[#008080]" />
                  )}
                </div>
              ))}
              {project.members.length > 4 && (
                <button 
                  onClick={() => onTabChange('members')}
                  className="text-xs text-[#008080] hover:text-[#006666] font-medium"
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
                    <Plus className="h-6 w-6 mb-2 text-[#008080]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Create Task</span>
                  </div>
                }
              />
            )}
            
            {permissions.canAddMembers && (
              <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-center"
                   onClick={() => onTabChange('members')}>
                <UserPlus className="h-6 w-6 mb-2 text-[#008080]" />
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
              className="bg-[#008080] h-1.5 rounded-full transition-all duration-300" 
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
                  {subtask.assignedUserName === project.currentUserId ? 'You' : subtask.assignedUserName}
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