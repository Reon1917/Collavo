// Extended project types for component usage

export interface Project {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  members: Member[];
  userPermissions: string[];
  isLeader: boolean;
  userRole: 'leader' | 'member' | null;
  currentUserId: string;
}

export interface Member {
  id: string;
  userId: string;
  role: 'leader' | 'member';
  joinedAt: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  permissions: string[];
}

export interface EditFormData {
  name: string;
  description: string;
  deadline: Date | undefined;
}

export interface RoleDisplay {
  label: string;
  icon: any;
  className: string;
}

 