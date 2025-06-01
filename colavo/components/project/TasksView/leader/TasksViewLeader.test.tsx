import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TasksViewLeader } from './TasksViewLeader';

// Mock TaskCard
jest.mock('../TaskCard/TaskCard', () => ({
  TaskCard: jest.fn(({ task }) => <div data-testid={`task-card-${task.id}`}>{task.title}</div>),
}));

// Mock CreateTaskForm (for empty state)
jest.mock('../../../project/CreateTaskForm', () => ({
  CreateTaskForm: jest.fn(() => <div data-testid="mock-create-task-form">Create Task Form</div>),
}));

const mockProject = {
  id: 'p1',
  name: 'Leader Project',
  members: [],
  userPermissions: ['createTask'],
  isLeader: true,
  currentUserId: 'leader1',
  // Fill other required Project fields
  description: null,
  deadline: null,
  userRole: 'leader' as 'leader' | 'member' | null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  leaderId: 'leader1',
  leaderName: 'Leader User',
  leaderEmail: 'leader@example.com',
};

const mockTasks = [
  { id: 'task-1', title: 'Leader Task 1', description: '...', importanceLevel: 'high', deadline: null, createdBy: 'leader1', createdAt: '', updatedAt: '', creatorName: '', creatorEmail: '', subTasks: [] },
  { id: 'task-2', title: 'Leader Task 2', description: '...', importanceLevel: 'medium', deadline: null, createdBy: 'leader1', createdAt: '', updatedAt: '', creatorName: '', creatorEmail: '', subTasks: [] },
];

const mockEmptyTasks: any[] = [];

describe('TasksViewLeader Component', () => {
  const commonProps = {
    projectId: 'p1',
    project: mockProject,
    onTaskCreated: jest.fn(),
    onTaskUpdated: jest.fn(),
    onTaskDeleted: jest.fn(),
    onSubTaskUpdated: jest.fn(),
    onSubTaskCreated: jest.fn(),
    onSubTaskDeleted: jest.fn(),
    canCreateTasks: true,
    rawTasksCount: mockTasks.length,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render a list of TaskCard components for all tasks passed', () => {
    render(<TasksViewLeader {...commonProps} tasks={mockTasks} />);
    expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument();
    expect(screen.getByText('Leader Task 1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-task-2')).toBeInTheDocument();
    expect(screen.getByText('Leader Task 2')).toBeInTheDocument();
    expect(require('../TaskCard/TaskCard').TaskCard).toHaveBeenCalledTimes(mockTasks.length);
  });

  test('should display "No tasks found" message and CreateTaskForm when tasks array is empty, canCreateTasks is true, and rawTasksCount is 0', () => {
    render(<TasksViewLeader {...commonProps} tasks={mockEmptyTasks} rawTasksCount={0} />);
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('No tasks have been created for this project yet.')).toBeInTheDocument();
    expect(screen.getByTestId('mock-create-task-form')).toBeInTheDocument();
  });

  test('should display "No tasks match your filters" message when tasks array is empty but rawTasksCount > 0', () => {
    render(<TasksViewLeader {...commonProps} tasks={mockEmptyTasks} rawTasksCount={5} />); // rawTasksCount is > 0
    expect(screen.getByText('No tasks match your filters')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filter criteria.')).toBeInTheDocument();
    // CreateTaskForm should not be shown in the empty state card if it's just a filter issue
    expect(screen.queryByTestId('mock-create-task-form')).not.toBeInTheDocument();
  });

  test('should not display CreateTaskForm in empty state if canCreateTasks is false', () => {
    render(<TasksViewLeader {...commonProps} tasks={mockEmptyTasks} canCreateTasks={false} rawTasksCount={0}/>);
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-create-task-form')).not.toBeInTheDocument();
  });
});
