export interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  permissions: string[];
}

export interface ProjectPermissions {
  userPermissions: string[];
  isLeader: boolean;
}

export interface MembersViewProps {
  projectId: string;
} 