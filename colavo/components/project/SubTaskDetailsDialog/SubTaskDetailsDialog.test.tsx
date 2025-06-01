import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubTaskDetailsDialog, SubTaskDetailsDialogProps } from './SubTaskDetailsDialog'; // Assuming props are exported

// Mock child components
const mockLeaderComponent = jest.fn(() => <div data-testid="subtask-dialog-leader">Leader View</div>);
const mockAssigneeComponent = jest.fn(() => <div data-testid="subtask-dialog-assignee">Assignee View</div>);

jest.mock('./leader/SubTaskDetailsDialogLeader', () => ({
  SubTaskDetailsDialogLeader: mockLeaderComponent,
}));
jest.mock('./member/SubTaskDetailsDialogAssignee', () => ({
  SubTaskDetailsDialogAssignee: mockAssigneeComponent,
}));

const mockSubTask = {
  id: 'st1',
  title: 'Test SubTask',
  description: 'Description',
  status: 'pending' as 'pending' | 'in_progress' | 'completed',
  note: '',
  deadline: null,
  assignedId: 'user-assignee',
  createdBy: 'user-creator',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assignedUserName: 'Assignee User',
  assignedUserEmail: 'assignee@example.com',
};

const mockMembers = [
    { id: 'm1', userId: 'user-assignee', userName: 'Assignee User', role: 'member' as 'leader' | 'member', userEmail:'assignee@example.com', userImage: null },
    { id: 'm2', userId: 'user-leader', userName: 'Leader User', role: 'leader' as 'leader' | 'member', userEmail:'leader@example.com', userImage: null },
];


describe('SubTaskDetailsDialog Component (Wrapper)', () => {
  const onOpenChangeMock = jest.fn();
  const onSubTaskUpdatedMock = jest.fn();
  const onSubTaskDeletedMock = jest.fn();

  const baseProps: SubTaskDetailsDialogProps = {
    isOpen: true,
    onOpenChange: onOpenChangeMock,
    subTask: mockSubTask,
    currentUserId: 'some-user',
    isProjectLeader: false,
    projectId: 'proj1',
    mainTaskId: 'task1',
    mainTaskDeadline: null,
    projectDeadline: null,
    members: mockMembers,
    onSubTaskUpdated: onSubTaskUpdatedMock,
    onSubTaskDeleted: onSubTaskDeletedMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render SubTaskDetailsDialogLeader when isProjectLeader is true', () => {
    render(<SubTaskDetailsDialog {...baseProps} isProjectLeader={true} currentUserId="user-leader" />);
    expect(screen.getByTestId('subtask-dialog-leader')).toBeInTheDocument();
    expect(screen.queryByTestId('subtask-dialog-assignee')).not.toBeInTheDocument();
    expect(mockLeaderComponent).toHaveBeenCalledWith(
      expect.objectContaining({ subTask: mockSubTask }),
      expect.anything()
    );
  });

  test('should render SubTaskDetailsDialogAssignee with effectiveCanUpdateStatus={true} for assignee (not leader)', () => {
    render(<SubTaskDetailsDialog {...baseProps} isProjectLeader={false} currentUserId="user-assignee" />);
    expect(screen.getByTestId('subtask-dialog-assignee')).toBeInTheDocument();
    expect(screen.queryByTestId('subtask-dialog-leader')).not.toBeInTheDocument();
    expect(mockAssigneeComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        subTask: mockSubTask,
        currentUserId: "user-assignee",
        effectiveCanUpdateStatus: true
      }),
      expect.anything()
    );
  });

  test('should render SubTaskDetailsDialogAssignee with effectiveCanUpdateStatus={false} for non-leader, non-assignee', () => {
    render(<SubTaskDetailsDialog {...baseProps} isProjectLeader={false} currentUserId="other-user" />);
    expect(screen.getByTestId('subtask-dialog-assignee')).toBeInTheDocument();
    expect(screen.queryByTestId('subtask-dialog-leader')).not.toBeInTheDocument();
    expect(mockAssigneeComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        subTask: mockSubTask,
        currentUserId: "other-user",
        effectiveCanUpdateStatus: false
      }),
      expect.anything()
    );
  });

  test('should call onOpenChange with false when requestClose is invoked by a child', () => {
    // To test this, we need to capture the `requestClose` prop passed to the child
    // and then call it.
    let capturedRequestClose: () => void = () => {};

    mockLeaderComponent.mockImplementationOnce((props: any) => {
      capturedRequestClose = props.requestClose; // Capture the passed function
      return <div data-testid="subtask-dialog-leader">Leader View</div>;
    });

    render(<SubTaskDetailsDialog {...baseProps} isProjectLeader={true} />);
    expect(screen.getByTestId('subtask-dialog-leader')).toBeInTheDocument();

    // Simulate the child calling requestClose
    capturedRequestClose();

    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
  });

   test('dialog should not be visible when isOpen is false', () => {
    render(<SubTaskDetailsDialog {...baseProps} isOpen={false} />);
    // The DialogContent itself might not be in the DOM if isOpen is false
    // Depending on how ui/dialog handles it.
    // We check that neither specific view is rendered.
    expect(screen.queryByTestId('subtask-dialog-leader')).not.toBeInTheDocument();
    expect(screen.queryByTestId('subtask-dialog-assignee')).not.toBeInTheDocument();
  });

});
