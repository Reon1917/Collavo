import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectViewMember } from './ProjectViewMember';
import { CheckCircle } from 'lucide-react'; // Import if used by the component

// Mock lucide-react if specific icons are checked beyond their presence
// For example, if you check for CheckCircle specifically:
jest.mock('lucide-react', () => {
  const original = jest.requireActual('lucide-react');
  return {
    ...original,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    // Mock other icons if needed by ProjectViewMember's direct render
  };
});


const mockMemberProject = {
  id: 'member-proj-1',
  name: 'Member View Project',
  description: 'A project for members.',
  members: [{ id: 'mem-1', userId: 'user-member', role: 'member', userName: 'Member User', userEmail: 'member@example.com', userImage: null, joinedAt: new Date().toISOString(), permissions: ['viewFiles'] }],
  userPermissions: ['viewFiles', 'createTask'], // Example member permissions
  isLeader: false,
  currentUserId: 'user-member',
   // Add other fields from the Project interface used by ProjectViewMember
  deadline: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  leaderId: 'leader-id',
  leaderName: 'Leader Name',
  leaderEmail: 'leader@example.com',
  userRole: 'member' as 'leader' | 'member' | null,
};

const mockTasks = [
  { id: 'task-1', title: 'Task One', subTasks: [] },
  { id: 'task-2', title: 'Task Two', subTasks: [] },
];

const mockRoleDisplay = {
  label: 'Team Member',
  icon: () => <svg data-testid="mock-user-icon" />, // Mock Lucide icon
  className: 'member-badge-class',
};

describe('ProjectViewMember Component', () => {
  const defaultProps = {
    project: mockMemberProject,
    tasks: mockTasks,
    roleDisplay: mockRoleDisplay,
  };

  test('should display the "Project Statistics" card with correct stats', () => {
    render(<ProjectViewMember {...defaultProps} />);
    expect(screen.getByText('Project Statistics')).toBeInTheDocument();
    // Check for specific stats (content may vary based on actual implementation)
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText(mockTasks.length.toString())).toBeInTheDocument(); // e.g., "2"

    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText(mockMemberProject.members.length.toString())).toBeInTheDocument(); // e.g., "1"

    expect(screen.getByText('Your Role')).toBeInTheDocument();
    expect(screen.getByText(mockRoleDisplay.label)).toBeInTheDocument(); // e.g., "Team Member"

    expect(screen.getByText('Permissions')).toBeInTheDocument();
    expect(screen.getByText(mockMemberProject.userPermissions.length.toString())).toBeInTheDocument(); // e.g., "2"
  });

  test('should display the "Your Permissions" card with listed permissions', () => {
    render(<ProjectViewMember {...defaultProps} />);
    expect(screen.getByText('Your Permissions')).toBeInTheDocument();

    // Check if permissions are listed (content depends on project.userPermissions)
    mockMemberProject.userPermissions.forEach(permission => {
      // Format permission name as it appears in the UI (e.g., "view files", "create task")
      const formattedPermission = permission.replace(/([A-Z])/g, ' $1').toLowerCase();
      expect(screen.getByText(new RegExp(formattedPermission, 'i'))).toBeInTheDocument();
    });
    // Check for the green check circle icons (assuming one per permission)
    expect(screen.getAllByTestId('check-circle-icon').length).toBe(mockMemberProject.userPermissions.length);
  });

  test('should display "No specific permissions assigned" if userPermissions is empty', () => {
    const projectWithNoPermissions = {
      ...mockMemberProject,
      userPermissions: [],
    };
    render(
      <ProjectViewMember
        {...defaultProps}
        project={projectWithNoPermissions}
      />
    );
    expect(screen.getByText('Your Permissions')).toBeInTheDocument();
    expect(screen.getByText('No specific permissions assigned')).toBeInTheDocument();
  });
});
