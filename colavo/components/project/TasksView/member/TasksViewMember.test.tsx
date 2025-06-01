import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TasksViewMember } from './TasksViewMember';

// Mock TaskCard
jest.mock('../TaskCard/TaskCard', () => ({
  TaskCard: jest.fn(({ task }) => <div data-testid={`task-card-${task.id}`}>{task.title}</div>),
}));

const mockProject = {
  id: 'p1',
  name: 'Member Project',
  members: [],
  userPermissions: [],
  isLeader: false,
  currentUserId: 'member1',
  // Fill other required Project fields
  description: null,
  deadline: null,
  userRole: 'member' as 'leader' | 'member' | null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  leaderId: 'leader-id',
  leaderName: 'Leader Name',
  leaderEmail: 'leader@example.com',
};

const mockTasks = [
  { id: 'task-1', title: 'Member Task 1', description: '...', importanceLevel: 'high', deadline: null, createdBy: 'otherUser', createdAt: '', updatedAt: '', creatorName: '', creatorEmail: '', subTasks: [] },
  { id: 'task-2', title: 'Member Task 2', description: '...', importanceLevel: 'medium', deadline: null, createdBy: 'member1', createdAt: '', updatedAt: '', creatorName: '', creatorEmail: '', subTasks: [] },
];

const mockEmptyTasks: any[] = [];

describe('TasksViewMember Component', () => {
  const commonProps = {
    projectId: 'p1',
    project: mockProject,
    onTaskUpdated: jest.fn(),
    onTaskDeleted: jest.fn(),
    onSubTaskUpdated: jest.fn(),
    onSubTaskCreated: jest.fn(),
    onSubTaskDeleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render a list of TaskCard components for tasks passed', () => {
    render(<TasksViewMember {...commonProps} tasks={mockTasks} canViewAllTasks={true} rawTasksCount={mockTasks.length} />);
    expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument();
    expect(screen.getByText('Member Task 1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-task-2')).toBeInTheDocument();
    expect(screen.getByText('Member Task 2')).toBeInTheDocument();
    expect(require('../TaskCard/TaskCard').TaskCard).toHaveBeenCalledTimes(mockTasks.length);
  });

  test('should display "No tasks assigned to you" message when tasks is empty, rawTasksCount is 0 and canViewAllTasks is false', () => {
    render(<TasksViewMember {...commonProps} tasks={mockEmptyTasks} canViewAllTasks={false} rawTasksCount={0} />);
    expect(screen.getByText('No tasks assigned to you')).toBeInTheDocument();
    expect(screen.getByText('Tasks assigned to you will appear here.')).toBeInTheDocument();
  });

  test('should display "No tasks found" message when tasks is empty, rawTasksCount is 0 and canViewAllTasks is true', () => {
    render(<TasksViewMember {...commonProps} tasks={mockEmptyTasks} canViewAllTasks={true} rawTasksCount={0} />);
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('No tasks have been created for this project yet.')).toBeInTheDocument();
  });

  test('should display "No tasks match your filters or assignment" message when tasks is empty but rawTasksCount > 0', () => {
    render(<TasksViewMember {...commonProps} tasks={mockEmptyTasks} canViewAllTasks={false} rawTasksCount={5} />);
    expect(screen.getByText('No tasks match your filters or assignment')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filter criteria, or check with your project leader.')).toBeInTheDocument();
  });
});
