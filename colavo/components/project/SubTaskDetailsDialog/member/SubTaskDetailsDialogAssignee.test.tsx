import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubTaskDetailsDialogAssignee } from './SubTaskDetailsDialogAssignee';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

const mockSubTaskAssignee = {
  id: 'st-assignee',
  title: 'Assignee SubTask',
  description: 'Description for assignee',
  status: 'in_progress' as 'pending' | 'in_progress' | 'completed',
  note: 'Assignee working on it.',
  deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  assignedId: 'user-assignee-id',
  assignedUserName: 'Current Assignee',
  createdBy: 'user-creator',
  createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  updatedAt: new Date().toISOString(),
  assignedUserEmail: 'assignee@example.com',
};

describe('SubTaskDetailsDialogAssignee Component', () => {
  const requestCloseMock = jest.fn();
  const onSubTaskUpdatedMock = jest.fn();

  const defaultProps = {
    subTask: mockSubTaskAssignee,
    currentUserId: 'user-assignee-id', // Current user is the assignee
    projectId: 'proj-assignee',
    mainTaskId: 'task-assignee',
    onSubTaskUpdated: onSubTaskUpdatedMock,
    requestClose: requestCloseMock,
    effectiveCanUpdateStatus: true, // Assume parent allows status update for assignee
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('View Mode (Assignee)', () => {
    it('displays subtask details and "Update Status" button when user is assignee and effectiveCanUpdateStatus is true', () => {
      render(<SubTaskDetailsDialogAssignee {...defaultProps} />);
      expect(screen.getByText(mockSubTaskAssignee.title)).toBeInTheDocument();
      expect(screen.getByText(mockSubTaskAssignee.description)).toBeInTheDocument();
      expect(screen.getByText(mockSubTaskAssignee.assignedUserName + ' (You)')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument(); // Status
      expect(screen.getByText(mockSubTaskAssignee.note)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Update Status' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Edit Details' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  describe('Status Edit Mode (Assignee)', () => {
    it('switches to status edit mode and submits update', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      render(<SubTaskDetailsDialogAssignee {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Update Status' }));

      expect(screen.getByText('Update Status & Notes')).toBeInTheDocument(); // Dialog title

      // Example: Change status and note
      // For Select: Assuming a way to select a new status. This often requires more complex setup for custom selects.
      // For now, we'll focus on the note change and assume status could be changed.
      fireEvent.change(screen.getByPlaceholderText('Add notes...'), { target: { value: 'Assignee updated note.' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save Update' }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          `/api/projects/proj-assignee/tasks/task-assignee/subtasks/st-assignee`,
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ status: mockSubTaskAssignee.status, note: 'Assignee updated note.' }),
          })
        );
        expect(toast.success).toHaveBeenCalledWith('Subtask status updated!');
        expect(onSubTaskUpdatedMock).toHaveBeenCalled();
        expect(requestCloseMock).toHaveBeenCalled();
      });
    });
  });

  describe('View Mode (Non-Assignee or Status Update Disabled)', () => {
    it('displays details as read-only and no "Update Status" button if effectiveCanUpdateStatus is false', () => {
      render(<SubTaskDetailsDialogAssignee {...defaultProps} effectiveCanUpdateStatus={false} />);
      expect(screen.getByText(mockSubTaskAssignee.title)).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Update Status' })).not.toBeInTheDocument();
    });

    it('displays details as read-only and no "Update Status" button if current user is not assignee (even if effectiveCanUpdateStatus is true)', () => {
      render(<SubTaskDetailsDialogAssignee {...defaultProps} currentUserId="other-user-id" effectiveCanUpdateStatus={true} />);
      expect(screen.getByText(mockSubTaskAssignee.title)).toBeInTheDocument();
      // The (You) part should not be there
      expect(screen.getByText(mockSubTaskAssignee.assignedUserName)).toBeInTheDocument();
      expect(screen.queryByText(mockSubTaskAssignee.assignedUserName + ' (You)')).not.toBeInTheDocument();

      expect(screen.queryByRole('button', { name: 'Update Status' })).not.toBeInTheDocument();
    });
  });
});
