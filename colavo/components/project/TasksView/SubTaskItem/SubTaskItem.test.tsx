import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubTaskItem } from './SubTaskItem'; // Assuming correct path

// Mock SubTaskDetailsDialog
jest.mock('../../../SubTaskDetailsDialog/SubTaskDetailsDialog', () => ({
  SubTaskDetailsDialog: jest.fn(({ isOpen, subTask }) =>
    isOpen ? <div data-testid="subtask-details-dialog">Details for {subTask.title}</div> : null
  ),
}));

const mockSubTask = {
  id: 'st1',
  title: 'Detailed Subtask',
  description: 'A subtask with many details.',
  status: 'in_progress' as 'pending' | 'in_progress' | 'completed',
  note: 'Almost done.',
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  assignedId: 'user1',
  createdBy: 'user2',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assignedUserName: 'Current User',
  assignedUserEmail: 'user1@example.com',
};

const mockTask = {
  id: 'task1',
  title: 'Main Task',
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // A week from now
};

const mockProjectBase = {
  id: 'proj1',
  deadline: null,
  members: [],
  userPermissions: [],
  isLeader: false,
  currentUserId: 'user1',
};

describe('SubTaskItem Component', () => {
  const onSubTaskUpdated = jest.fn();
  const onSubTaskDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSubTaskItem = (subTaskProps?: Partial<typeof mockSubTask>, projectProps?: Partial<typeof mockProjectBase>) => {
    const subtask = { ...mockSubTask, ...subTaskProps };
    const project = { ...mockProjectBase, ...projectProps };
    // Cast task to the expected type if only partial mockTask is used
    const task = mockTask as any;

    return render(
      <SubTaskItem
        subtask={subtask}
        task={task}
        project={project}
        onSubTaskUpdated={onSubTaskUpdated}
        onSubTaskDeleted={onSubTaskDeleted}
      />
    );
  };

  test('displays subtask title, assignee, and deadline', () => {
    renderSubTaskItem();
    expect(screen.getByText(mockSubTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockSubTask.assignedUserName + ' (You)')).toBeInTheDocument(); // Since currentUserId is 'user1'
    expect(screen.getByText(/Due tomorrow/i)).toBeInTheDocument(); // Example, date-fns output
    expect(screen.getByText('In Progress', { exact: false })).toBeInTheDocument(); // Status badge
  });

  test('clicking the item opens SubTaskDetailsDialog', () => {
    renderSubTaskItem();
    const itemDiv = screen.getByText(mockSubTask.title).closest('div.flex-1')?.parentElement; // Get the clickable div
    expect(itemDiv).toBeInTheDocument();
    if(itemDiv) fireEvent.click(itemDiv);

    expect(screen.getByTestId('subtask-details-dialog')).toBeInTheDocument();
    expect(screen.getByText(`Details for ${mockSubTask.title}`)).toBeInTheDocument();
  });

  test('displays "Can Edit" badge if user can update subtask (assignee)', () => {
    renderSubTaskItem({ assignedId: 'user1' }, { currentUserId: 'user1' });
    expect(screen.getByText('Can Edit')).toBeInTheDocument();
  });

  test('displays "Can Edit" badge if user is project leader', () => {
    renderSubTaskItem({ assignedId: 'user2' }, { currentUserId: 'user1', isLeader: true });
    expect(screen.getByText('Can Edit')).toBeInTheDocument();
  });

  test('displays "Can Edit" badge if user has "updateTask" permission', () => {
    renderSubTaskItem({ assignedId: 'user2' }, { currentUserId: 'user1', userPermissions: ['updateTask'] });
    expect(screen.getByText('Can Edit')).toBeInTheDocument();
  });

  test('does not display "Can Edit" badge if user cannot update subtask', () => {
    renderSubTaskItem({ assignedId: 'user2' }, { currentUserId: 'user3', userPermissions: [] }); // Different user, no permissions
    expect(screen.queryByText('Can Edit')).not.toBeInTheDocument();
  });
});
