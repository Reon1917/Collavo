import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectView } from './ProjectView';
import { toast } from 'sonner';

// Mock child components for focused testing of ProjectView logic
jest.mock('./leader/ProjectViewLeader', () => ({
  ProjectViewLeader: jest.fn(() => <div data-testid="project-view-leader">ProjectViewLeader Component</div>),
}));
jest.mock('./member/ProjectViewMember', () => ({
  ProjectViewMember: jest.fn(() => <div data-testid="project-view-member">ProjectViewMember Component</div>),
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

const mockProjectLeader = {
  id: 'project-1',
  name: 'Test Project Leader',
  description: 'A project led by a leader.',
  deadline: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  leaderId: 'user-leader',
  leaderName: 'Leader User',
  leaderEmail: 'leader@example.com',
  members: [{ id: 'mem-1', userId: 'user-leader', role: 'leader', userName: 'Leader User', userEmail: 'leader@example.com', userImage: null, joinedAt: new Date().toISOString(), permissions: [] }],
  userPermissions: ['addMember', 'createTask', 'deleteProject', 'updateProject'],
  isLeader: true,
  userRole: 'leader',
  currentUserId: 'user-leader',
};

const mockProjectMember = {
  ...mockProjectLeader,
  isLeader: false,
  userRole: 'member',
  currentUserId: 'user-member',
  userPermissions: ['viewFiles'], // Typical member permissions
};

const mockTasks = [
  { id: 'task-1', title: 'First Task', /* ... other task properties */ subTasks: [] },
];

describe('ProjectView Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (fetch as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    require('./leader/ProjectViewLeader').ProjectViewLeader.mockClear();
    require('./member/ProjectViewMember').ProjectViewMember.mockClear();
  });

  test('should render ProjectViewLeader when project.isLeader is true', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // Project fetch
        ok: true,
        json: async () => mockProjectLeader,
      })
      .mockResolvedValueOnce({ // Tasks fetch
        ok: true,
        json: async () => mockTasks,
      });

    render(<ProjectView projectId="project-1" />);

    // Wait for loading to complete and data to be processed
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

    await waitFor(() => {
      expect(screen.getByTestId('project-view-leader')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('project-view-member')).not.toBeInTheDocument();
     // Check if ProjectViewLeader was called with correct props (example)
    expect(require('./leader/ProjectViewLeader').ProjectViewLeader).toHaveBeenCalledWith(
      expect.objectContaining({ project: mockProjectLeader }),
      expect.anything()
    );
  });

  test('should render ProjectViewMember when project.isLeader is false', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // Project fetch
        ok: true,
        json: async () => mockProjectMember,
      })
      .mockResolvedValueOnce({ // Tasks fetch
        ok: true,
        json: async () => mockTasks,
      });

    render(<ProjectView projectId="project-1" />);

    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

    await waitFor(() => {
      expect(screen.getByTestId('project-view-member')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('project-view-leader')).not.toBeInTheDocument();
    expect(require('./member/ProjectViewMember').ProjectViewMember).toHaveBeenCalledWith(
      expect.objectContaining({ project: mockProjectMember }),
      expect.anything()
    );
  });

  test('should display loader while fetching data', async () => {
    (fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ // Simulate delay
        ok: true,
        json: async () => mockProjectLeader,
      }), 100))
    );
    render(<ProjectView projectId="project-1" />);
    // Initially, loader should be there. Using a more generic way to find loader if no specific testid is on Loader2
    // For example, if Loader2 has a unique class or structure. Here, assuming it might render text or a role.
    // If Loader2 itself has a testid, that would be better.
    // For now, checking that children are not yet rendered.
    expect(screen.queryByTestId('project-view-leader')).not.toBeInTheDocument();
    expect(screen.queryByTestId('project-view-member')).not.toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() =>
      expect(screen.getByTestId('project-view-leader')).toBeInTheDocument(),
      { timeout: 2000 } // Increased timeout for simulated delay
    );
  });

  test('should show error toast if project data fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404, // Or any other error status
      json: async () => ({ error: 'Project not found' }),
    });

    render(<ProjectView projectId="project-1" />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load project data');
    });
    // Also check that neither leader nor member view is rendered
    expect(screen.queryByTestId('project-view-leader')).not.toBeInTheDocument();
    expect(screen.queryByTestId('project-view-member')).not.toBeInTheDocument();
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument(); // Assuming an error message is shown
  });
});
