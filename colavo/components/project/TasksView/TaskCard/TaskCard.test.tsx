import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCard } from './TaskCard'; // Assuming correct path
import { toast } from 'sonner';

// Mock child components
jest.mock('../../../project/EditTaskDialog', () => ({
  EditTaskDialog: jest.fn(({ isOpen, onOpenChange, task }) => isOpen ? <div data-testid="edit-task-dialog">Edit Task: {task.title}</div> : null),
}));
jest.mock('../../../project/CreateSubTaskForm', () => ({
  CreateSubTaskForm: jest.fn(({ open, onOpenChange }) => open ? <div data-testid="create-sub-task-form">Create SubTask Form</div> : null),
}));
jest.mock('../SubTaskItem/SubTaskItem', () => ({
  SubTaskItem: jest.fn(({ subtask }) => <div data-testid={`sub-task-item-${subtask.id}`}>{subtask.title}</div>),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();


const mockProjectBase = {
  id: 'p1',
  name: 'Test Project',
  deadline: null,
  members: [],
  userPermissions: [],
  isLeader: false,
  currentUserId: 'user1',
};

const mockTaskBase = {
  id: 'task1',
  title: 'Sample Task Title',
  description: 'This is a sample task description.',
  importanceLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  createdBy: 'user2',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  creatorName: 'Other User',
  creatorEmail: 'other@example.com',
  subTasks: [
    { id: 'st1', title: 'Subtask 1', status: 'completed', assignedId: 'user1', description:null, note:null, deadline:null, createdBy:'user2', createdAt: new Date().toISOString(), updatedAt:new Date().toISOString(), assignedUserName: 'Current User', assignedUserEmail: 'user1@ex.com' },
    { id: 'st2', title: 'Subtask 2', status: 'pending', assignedId: 'user2', description:null, note:null, deadline:null, createdBy:'user1', createdAt: new Date().toISOString(), updatedAt:new Date().toISOString(), assignedUserName: 'Other User', assignedUserEmail: 'user2@ex.com' },
  ],
};

describe('TaskCard Component', () => {
  const onTaskUpdated = jest.fn();
  const onTaskDeleted = jest.fn();
  const onSubTaskUpdated = jest.fn();
  const onSubTaskCreated = jest.fn();
  const onSubTaskDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  const renderTaskCard = (taskProps?: Partial<typeof mockTaskBase>, projectProps?: Partial<typeof mockProjectBase>) => {
    const task = { ...mockTaskBase, ...taskProps };
    const project = { ...mockProjectBase, ...projectProps };
    return render(
      <TaskCard
        task={task}
        project={project}
        onTaskUpdated={onTaskUpdated}
        onTaskDeleted={onTaskDeleted}
        onSubTaskUpdated={onSubTaskUpdated}
        onSubTaskCreated={onSubTaskCreated}
        onSubTaskDeleted={onSubTaskDeleted}
      />
    );
  };

  test('renders task details correctly', () => {
    renderTaskCard();
    expect(screen.getByText(mockTaskBase.title)).toBeInTheDocument();
    expect(screen.getByText(mockTaskBase.description)).toBeInTheDocument();
    expect(screen.getByText(mockTaskBase.importanceLevel, { exact: false })).toBeInTheDocument(); // case-insensitive partial match
    expect(screen.getByText(`Created by ${mockTaskBase.creatorName}`)).toBeInTheDocument();
    expect(screen.getByText(/Due in 3 days/i)).toBeInTheDocument(); // Example, date-fns output
  });

  test('progress bar calculation and display', () => {
    renderTaskCard(); // 1 of 2 subtasks completed for current user (user1) if viewFiles is not present
    // If project.userPermissions includes 'viewFiles' or isLeader=true, it's 1 of 2 globally
    // Current mock project is not leader and no viewFiles, so it sees only assigned st1
    expect(screen.getByText('Progress (Your Tasks)')).toBeInTheDocument(); // Assuming !canViewAllTasks
    expect(screen.getByText('100%')).toBeInTheDocument(); // st1 is completed, st2 not assigned to user1
    expect(screen.getByText('1 of 1 subtasks completed (assigned to you)')).toBeInTheDocument();

    // Test with viewFiles permission
    renderTaskCard({}, { userPermissions: ['viewFiles'] });
    expect(screen.getByText('Progress')).toBeInTheDocument(); // No longer "(Your Tasks)"
    expect(screen.getByText('50%')).toBeInTheDocument(); // 1 of 2 global subtasks completed
    expect(screen.getByText('1 of 2 subtasks completed')).toBeInTheDocument();
  });

  describe('Action Dropdown Visibility', () => {
    test('shows all actions for project leader', () => {
      renderTaskCard({}, { isLeader: true, userPermissions: ['createTask', 'updateTask', 'deleteTask'] });
      fireEvent.click(screen.getByRole('button', { name: /More options/i })); // Assuming MoreVertical has an aria-label or similar
      expect(screen.getByText('Add Subtask')).toBeVisible();
      expect(screen.getByText('Edit Task')).toBeVisible();
      expect(screen.getByText('Delete Task')).toBeVisible();
    });

    test('shows actions for task creator with permissions', () => {
      renderTaskCard({ createdBy: 'user1' }, { userPermissions: ['createTask', 'updateTask', 'deleteTask'] });
      fireEvent.click(screen.getByRole('button', { name: /More options/i }));
      expect(screen.getByText('Add Subtask')).toBeVisible();
      expect(screen.getByText('Edit Task')).toBeVisible();
      expect(screen.getByText('Delete Task')).toBeVisible();
    });

    test('hides Edit/Delete for non-creator/non-leader without specific update/delete permissions', () => {
      renderTaskCard({ createdBy: 'user2' }, { userPermissions: ['createTask'] }); // Can create subtasks, but not edit/delete this task
      fireEvent.click(screen.getByRole('button', { name: /More options/i }));
      expect(screen.getByText('Add Subtask')).toBeVisible();
      expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete Task')).not.toBeInTheDocument();
    });
  });

  test('clicking "Add Subtask" opens CreateSubTaskForm dialog', () => {
    renderTaskCard({}, { isLeader: true, userPermissions: ['createTask'] });
    fireEvent.click(screen.getByRole('button', { name: /More options/i }));
    fireEvent.click(screen.getByText('Add Subtask'));
    expect(screen.getByTestId('create-sub-task-form')).toBeInTheDocument();
  });

  test('clicking "Edit Task" opens EditTaskDialog', () => {
    renderTaskCard({}, { isLeader: true, userPermissions: ['updateTask'] });
    fireEvent.click(screen.getByRole('button', { name: /More options/i }));
    fireEvent.click(screen.getByText('Edit Task'));
    expect(screen.getByTestId('edit-task-dialog')).toBeInTheDocument();
    expect(screen.getByText(`Edit Task: ${mockTaskBase.title}`)).toBeInTheDocument();
  });

  test('delete confirmation dialog appears and works', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    renderTaskCard({}, { isLeader: true, userPermissions: ['deleteTask'] });
    fireEvent.click(screen.getByRole('button', { name: /More options/i }));
    fireEvent.click(screen.getByText('Delete Task'));

    // This assumes the custom confirmation dialog is rendered.
    // If it's a browser confirm, this test needs adjustment.
    // For this example, assuming a custom dialog rendered within TaskCard.
    expect(screen.getByText('Are you sure you want to delete this task?')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' })); // Confirm delete

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/projects/p1/tasks/task1`, { method: 'DELETE' });
      expect(toast.success).toHaveBeenCalledWith('Task deleted successfully');
      expect(onTaskDeleted).toHaveBeenCalledWith('task1');
    });
  });

});
