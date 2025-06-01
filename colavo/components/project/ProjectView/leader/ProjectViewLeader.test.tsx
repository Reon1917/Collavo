import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectViewLeader } from './ProjectViewLeader';
import { toast } from 'sonner';

// Mock child components that are complex or make external calls if necessary
// For example, CreateTaskForm, Dialogs (if not testing their content explicitly here)
jest.mock('@/components/project/CreateTaskForm', () => ({
  CreateTaskForm: jest.fn(({ trigger }) => <div onClick={(trigger as any).props.onClick} data-testid="mock-create-task-form">{trigger}</div>),
}));
jest.mock('@/components/ui/dialog', () => ({
  Dialog: jest.fn(({ children, open }) => open ? <div data-testid="mock-dialog">{children}</div> : null),
  DialogContent: jest.fn(({ children }) => <div>{children}</div>),
  DialogHeader: jest.fn(({ children }) => <div>{children}</div>),
  DialogTitle: jest.fn(({ children }) => <div>{children}</div>),
  DialogDescription: jest.fn(({ children }) => <div>{children}</div>),
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

const mockLeaderProject = {
  id: 'leader-proj-1',
  name: 'Leader Super Project',
  description: 'A super project for leaders.',
  deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // One week from now
  members: [],
  userPermissions: ['createTask', 'addMember', 'updateProject', 'deleteProject'],
  isLeader: true,
  currentUserId: 'leader-user-id',
  // Add other fields as per the Project interface used by ProjectViewLeader
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  leaderId: 'leader-user-id',
  leaderName: 'The Leader',
  leaderEmail: 'leader@example.com',
  userRole: 'leader' as 'leader' | 'member' | null,
};

const mockTasks = [
    // Add mock tasks if ProjectViewLeader displays task counts or similar
];

const mockRoleDisplay = {
    label: 'Project Leader',
    icon: () => <svg data-testid="mock-crown-icon" />, // Mock Lucide icon
    className: 'leader-badge-class',
};


describe('ProjectViewLeader Component', () => {
  const mockFetchProjectData = jest.fn();
  const mockHandleTaskCreated = jest.fn();
  const mockSetActiveTab = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  const defaultProps = {
    project: mockLeaderProject,
    projectId: mockLeaderProject.id,
    fetchProjectData: mockFetchProjectData,
    handleTaskCreated: mockHandleTaskCreated,
    setActiveTab: mockSetActiveTab,
    canCreateTasks: true,
    canAddMembers: true,
    tasks: mockTasks,
    roleDisplay: mockRoleDisplay,
  };

  test('should display the "Project Management" card and related elements', () => {
    render(<ProjectViewLeader {...defaultProps} />);
    expect(screen.getByText('Project Management')).toBeInTheDocument();
    expect(screen.getByText('Manage your project settings and team.')).toBeInTheDocument();
    // Check for quick actions section
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Create New Task')).toBeInTheDocument(); // From CreateTaskForm trigger
    expect(screen.getByText('Add Team Member')).toBeInTheDocument();
    // Check for project settings section
    expect(screen.getByText('Project Settings')).toBeInTheDocument();
    expect(screen.getByText('Edit Project Details')).toBeInTheDocument();
    expect(screen.getByText('Delete Project')).toBeInTheDocument();
  });

  test('clicking "Edit Project Details" button opens the edit dialog', () => {
    render(<ProjectViewLeader {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    // Assuming Dialog mock renders its children when open
    // Check for a title or unique element within the Edit Project Dialog
    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
    // More specific check if DialogTitle is rendered by the mock
    expect(screen.getByText('Edit Project Details')).toBeVisible();
  });

  test('clicking "Delete Project" button opens the delete confirmation dialog', () => {
    render(<ProjectViewLeader {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
    expect(screen.getByText((content) => content.startsWith('Are you sure you want to delete'))).toBeVisible();
  });

  test('handleEditProject success flow', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // Successful update
    });

    render(<ProjectViewLeader {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' })); // Open dialog

    // Simulate form input if necessary - for now, assume form is pre-filled and valid
    // For example: fireEvent.change(screen.getByLabelText(/Project Name/i), { target: { value: 'Updated Project Name' } });

    // Find the "Update Project" button within the dialog. This might need a more specific selector if multiple such buttons exist.
    // This assumes the mock dialog renders its children and the button is identifiable.
    // If Dialog is fully mocked and doesn't render children, this part needs adjustment.
    const updateButton = await screen.findByRole('button', { name: 'Update Project' });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/projects/${mockLeaderProject.id}`, expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Project updated successfully!');
      expect(mockFetchProjectData).toHaveBeenCalledTimes(1);
    });
  });

   test('handleDeleteProject success flow', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // Successful delete
    });
    // Mock window.location.href
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: jest.fn() };


    render(<ProjectViewLeader {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' })); // Open delete confirmation

    const confirmDeleteButton = await screen.findByRole('button', { name: 'Delete Project' }); // This is the button in the confirmation
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(`/api/projects/${mockLeaderProject.id}`, {method: 'DELETE'});
        expect(toast.success).toHaveBeenCalledWith('Project deleted successfully!');
        expect(window.location.href).toBe('/dashboard');
    });
    window.location = originalLocation; // Restore original location
  });

});
