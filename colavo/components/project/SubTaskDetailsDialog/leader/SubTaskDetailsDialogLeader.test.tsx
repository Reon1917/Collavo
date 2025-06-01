import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubTaskDetailsDialogLeader } from './SubTaskDetailsDialogLeader';
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

// Mock ConfirmationDialog
jest.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: jest.fn(({ isOpen, onConfirm, onOpenChange, title }) =>
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <div>{title}</div>
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={() => onOpenChange(false)}>Cancel Delete</button>
      </div>
    ) : null
  ),
}));

const mockSubTaskLeader = {
  id: 'st-leader',
  title: 'Leader SubTask',
  description: 'Full control description',
  status: 'pending' as 'pending' | 'in_progress' | 'completed',
  note: 'Initial note by leader.',
  deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
  assignedId: 'user-assignee',
  assignedUserName: 'Assignee User',
  createdBy: 'user-creator',
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  updatedAt: new Date().toISOString(),
  assignedUserEmail: 'assignee@example.com',
};

const mockMembersLeader = [
  { id: 'm1', userId: 'user-assignee', userName: 'Assignee User', role: 'member' as 'leader' | 'member', userEmail:'assignee@example.com', userImage: null },
  { id: 'm2', userId: 'user-leader', userName: 'Project Leader', role: 'leader' as 'leader' | 'member', userEmail:'leader@example.com', userImage: null },
];

describe('SubTaskDetailsDialogLeader Component', () => {
  const requestCloseMock = jest.fn();
  const onSubTaskUpdatedMock = jest.fn();
  const onSubTaskDeletedMock = jest.fn();

  const defaultProps = {
    subTask: mockSubTaskLeader,
    projectId: 'proj-leader',
    mainTaskId: 'task-leader',
    mainTaskDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    projectDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    members: mockMembersLeader,
    onSubTaskUpdated: onSubTaskUpdatedMock,
    onSubTaskDeleted: onSubTaskDeletedMock,
    requestClose: requestCloseMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('View Mode', () => {
    it('displays subtask details and all action buttons', () => {
      render(<SubTaskDetailsDialogLeader {...defaultProps} />);
      expect(screen.getByText(mockSubTaskLeader.title)).toBeInTheDocument();
      expect(screen.getByText(mockSubTaskLeader.description)).toBeInTheDocument();
      expect(screen.getByText(mockSubTaskLeader.assignedUserName)).toBeInTheDocument();
      expect(screen.getByText(mockSubTaskLeader.note)).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument(); // Status
      expect(screen.getByRole('button', { name: 'Update Status' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Details' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument(); // Match by text or aria-label
    });
  });

  describe('Status Edit Mode', () => {
    it('switches to status edit mode and submits update', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      render(<SubTaskDetailsDialogLeader {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Update Status' }));

      expect(screen.getByText('Update Status & Notes')).toBeInTheDocument(); // Dialog title changes

      // Example: Change status (assuming Select component works with fireEvent or a custom mock)
      // This part is tricky with custom Selects. A data-testid on SelectTrigger/Item would be better.
      // For now, we'll directly target the save button assuming status is already different or note is changed.
      fireEvent.change(screen.getByPlaceholderText('Add notes...'), { target: { value: 'Updated note by leader.' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save Update' }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          `/api/projects/proj-leader/tasks/task-leader/subtasks/st-leader`,
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ status: mockSubTaskLeader.status, note: 'Updated note by leader.' }),
          })
        );
        expect(toast.success).toHaveBeenCalledWith('Subtask status updated!');
        expect(onSubTaskUpdatedMock).toHaveBeenCalled();
        expect(requestCloseMock).toHaveBeenCalled();
      });
    });
  });

  describe('Details Edit Mode', () => {
    it('switches to details edit mode and submits update', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      render(<SubTaskDetailsDialogLeader {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Edit Details' }));

      expect(screen.getByText('Edit Subtask Details')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Updated Title by Leader' } });
      // More field changes can be simulated here

      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          `/api/projects/proj-leader/tasks/task-leader/subtasks/st-leader`,
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('"title":"Updated Title by Leader"'),
          })
        );
        expect(toast.success).toHaveBeenCalledWith('Subtask details updated!');
        expect(onSubTaskUpdatedMock).toHaveBeenCalled();
        expect(requestCloseMock).toHaveBeenCalled();
      });
    });

    it('validates required fields in details edit mode', async () => {
        render(<SubTaskDetailsDialogLeader {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Edit Details' }));

        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: '' } }); // Empty title
        fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Subtask title is required');
        });
        expect(fetch).not.toHaveBeenCalled();
      });
  });

  describe('Delete Action', () => {
    it('opens confirmation and deletes subtask upon confirmation', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      render(<SubTaskDetailsDialogLeader {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Subtask')).toBeInTheDocument(); // Title of confirmation

      fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          `/api/projects/proj-leader/tasks/task-leader/subtasks/st-leader`,
          { method: 'DELETE' }
        );
        expect(toast.success).toHaveBeenCalledWith('Subtask deleted successfully!');
        expect(onSubTaskDeletedMock).toHaveBeenCalledWith(mockSubTaskLeader.id);
        expect(requestCloseMock).toHaveBeenCalled();
      });
    });
  });
});
