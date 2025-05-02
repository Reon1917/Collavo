import { User, Project, Task, Resource, ProjectMember } from '../types';
import mockUsers from '../data/mockdata1.json';
import mockTasksResources from '../data/mockdata2.json';

// Type assertions for our mock data
const users = mockUsers.users as User[];
const projects = mockUsers.projects as Project[];
const tasks = mockTasksResources.tasks as Task[];
const resources = mockTasksResources.resources as Resource[];

// User data functions
export async function getCurrentUser(): Promise<User> {
  // For the prototype, we'll assume user1 is the current user
  return users.find(user => user.id === 'user1') as User;
}

export async function getUsers(): Promise<User[]> {
  return users;
}

export async function getUserById(id: string): Promise<User | undefined> {
  return users.find(user => user.id === id);
}

// Project data functions
export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return projects.find(project => project.id === id);
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  return projects.filter(project => 
    project.members.some((member: ProjectMember) => member.userId === userId)
  );
}

export async function getProjectsLedByUserId(userId: string): Promise<Project[]> {
  return projects.filter(project => project.leader === userId);
}

export async function getProjectsMembershipByUserId(userId: string): Promise<Project[]> {
  return projects.filter(project => 
    project.members.some((member: ProjectMember) => member.userId === userId && member.role === 'member')
  );
}

// Task data functions
export async function getTasks(): Promise<Task[]> {
  return tasks;
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return tasks.find(task => task.id === id);
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  return tasks.filter(task => task.projectId === projectId);
}

export async function getTasksByAssignee(userId: string): Promise<Task[]> {
  return tasks.filter(task => task.assignedTo === userId);
}

// Resource data functions
export async function getResources(): Promise<Resource[]> {
  return resources;
}

export async function getResourceById(id: string): Promise<Resource | undefined> {
  return resources.find(resource => resource.id === id);
}

export async function getResourcesByProjectId(projectId: string): Promise<Resource[]> {
  return resources.filter(resource => resource.projectId === projectId);
}
