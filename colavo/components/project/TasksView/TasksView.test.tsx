import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TasksView } from './TasksView';
import { toast } from 'sonner';

// Mock child components
jest.mock('./leader/TasksViewLeader', () => ({
  TasksViewLeader: jest.fn(({ tasks }) => <div data-testid="tasks-view-leader">{tasks.length} tasks</div>),
}));
jest.mock('./member/TasksViewMember', () => ({
  TasksViewMember: jest.fn(({ tasks }) => <div data-testid="tasks-view-member">{tasks.length} tasks</div>),
}));
jest.mock('../../project/CreateTaskForm', () => ({
  CreateTaskForm: jest.fn(() => <button data-testid="create-task-form">Create Task</button>),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

const mockLeaderProject = {
  id: 'project-1',
  name: 'Test Project',
  members: [{ id: 'm1', userId: 'u1', role: 'leader', userName: 'Test User', userEmail: 'test@user.com', userImage: null }],
  userPermissions: ['createTask', 'viewFiles', 'addMember'], // Permissions for a leader or full-access member
  isLeader: true,
  currentUserId: 'u1',
  // other necessary project fields
  description: null,
  deadline: null,
  userRole: 'leader' as 'leader' | 'member' | null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  leaderId: 'u1',
  leaderName: 'Test User',
  leaderEmail: 'test@user.com',
};

const mockMemberProjectLimitedView = {
  ...mockLeaderProject,
  isLeader: false,
  userPermissions: ['createTask'], // Can create tasks, but not view all files
  userRole: 'member' as 'leader' | 'member' | null,
};

const mockTasksFull = [
  { id: 't1', title: 'Task Alpha', description: 'First task', importanceLevel: 'high', deadline: null, createdBy: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), creatorName: 'Test User', creatorEmail: 'test@user.com', subTasks: [{id: 'st1', assignedId: 'u2', title: 'sub1', status: 'pending', description:null, note:null, deadline:null, createdBy:'u1', createdAt: new Date().toISOString(), updatedAt:new Date().toISOString(), assignedUserName: 'User Two', assignedUserEmail: 'u2@ex.com'}] },
  { id: 't2', title: 'Task Beta', description: 'Second task', importanceLevel: 'medium', deadline: null, createdBy: 'u2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), creatorName: 'Other User', creatorEmail: 'other@user.com', subTasks: [{id: 'st2', assignedId: 'u1', title: 'sub2', status: 'completed', description:null, note:null, deadline:null, createdBy:'u2', createdAt: new Date().toISOString(), updatedAt:new Date().toISOString(), assignedUserName: 'Test User', assignedUserEmail: 'u1@ex.com'}] },
  { id: 't3', title: 'Task Gamma', description: 'Third task, by current user', importanceLevel: 'low', deadline: null, createdBy: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), creatorName: 'Test User', creatorEmail: 'test@user.com', subTasks: [] },
];


describe('TasksView Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    require('./leader/TasksViewLeader').TasksViewLeader.mockClear();
    require('./member/TasksViewMember').TasksViewMember.mockClear();
    require('../../project/CreateTaskForm').CreateTaskForm.mockClear();
  });

  const setupFetchMocks = (projectData: any, tasksData: any) => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => projectData }) // Project fetch
      .mockResolvedValueOnce({ ok: true, json: async () => tasksData });  // Tasks fetch
  };

  test('should render TasksViewLeader when user isLeader', async () => {
    setupFetchMocks(mockLeaderProject, mockTasksFull);
    render(<TasksView projectId="project-1" />);
    await waitFor(() => expect(screen.getByTestId('tasks-view-leader')).toBeInTheDocument());
    expect(screen.queryByTestId('tasks-view-member')).not.toBeInTheDocument();
  });

  test('should render TasksViewLeader when user has viewFiles permission (even if not leader)', async () => {
    const projectWithViewFiles = { ...mockMemberProjectLimitedView, userPermissions: ['viewFiles', 'createTask'] };
    setupFetchMocks(projectWithViewFiles, mockTasksFull);
    render(<TasksView projectId="project-1" />);
    await waitFor(() => expect(screen.getByTestId('tasks-view-leader')).toBeInTheDocument());
    expect(screen.queryByTestId('tasks-view-member')).not.toBeInTheDocument();
  });

  test('should render TasksViewMember when user is not leader and lacks viewFiles permission', async () => {
    setupFetchMocks(mockMemberProjectLimitedView, mockTasksFull); // No viewFiles permission
    render(<TasksView projectId="project-1" />);
    await waitFor(() => expect(screen.getByTestId('tasks-view-member')).toBeInTheDocument());
    expect(screen.queryByTestId('tasks-view-leader')).not.toBeInTheDocument();
  });

  test('CreateTaskForm in header should be visible if canCreateTasks is true', async () => {
    setupFetchMocks(mockLeaderProject, mockTasksFull); // mockLeaderProject has createTask permission
    render(<TasksView projectId="project-1" />);
    await waitFor(() => expect(screen.getByTestId('create-task-form')).toBeInTheDocument());
  });

  test('CreateTaskForm in header should be hidden if canCreateTasks is false', async () => {
    const projectWithoutCreate = { ...mockLeaderProject, userPermissions: ['viewFiles'] };
    setupFetchMocks(projectWithoutCreate, mockTasksFull);
    render(<TasksView projectId="project-1" />);
    await waitFor(() => expect(screen.queryByTestId('create-task-form')).not.toBeInTheDocument());
  });

  test('should render search and filter controls', async () => {
    setupFetchMocks(mockLeaderProject, mockTasksFull);
    render(<TasksView projectId="project-1" />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
      expect(screen.getByText('All Importance')).toBeInTheDocument(); // From SelectValue placeholder or rendered value
      expect(screen.getByText('All Status')).toBeInTheDocument();
      expect(screen.getByText('Created Date')).toBeInTheDocument(); // Default sort
    });
  });

  test('tasks passed to TasksViewLeader should be filtered by search query', async () => {
    setupFetchMocks(mockLeaderProject, mockTasksFull);
    render(<TasksView projectId="project-1" />);
    await waitFor(() => expect(screen.getByTestId('tasks-view-leader')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Search tasks...'), { target: { value: 'Alpha' } });

    await waitFor(() => {
      expect(require('./leader/TasksViewLeader').TasksViewLeader).toHaveBeenCalledWith(
        expect.objectContaining({ tasks: [expect.objectContaining({ title: 'Task Alpha' })] }),
        expect.anything()
      );
    });
  });

  test('tasks passed to TasksViewMember (limited view) are further filtered', async () => {
    // Current user 'u1', member project, no 'viewFiles'
    // Task Alpha: subtask assigned to u2
    // Task Beta: subtask assigned to u1
    // Task Gamma: created by u1
    setupFetchMocks(mockMemberProjectLimitedView, mockTasksFull);
    render(<TasksView projectId="project-1" />);

    await waitFor(() => {
      const memberView = require('./member/TasksViewMember').TasksViewMember;
      expect(memberView).toHaveBeenCalledTimes(1);
      const calls = memberView.mock.calls;
      const lastCallProps = calls[calls.length - 1][0];

      // Expecting Task Beta (assigned subtask) and Task Gamma (created by current user)
      expect(lastCallProps.tasks.length).toBe(2);
      expect(lastCallProps.tasks.find((t: Task) => t.id === 't2')).toBeDefined(); // Task Beta
      expect(lastCallProps.tasks.find((t: Task) => t.id === 't3')).toBeDefined(); // Task Gamma
      expect(lastCallProps.tasks.find((t: Task) => t.id === 't1')).toBeUndefined(); // Task Alpha
    });
  });
});
