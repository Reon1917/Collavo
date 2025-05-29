import { User, Project, Task, Resource, ProjectMember } from '../types';

// Placeholder functions that need to be replaced with real backend calls
const BACKEND_NOT_IMPLEMENTED = 'Backend not implemented yet. Replace this function with real API call.';

// User data functions
export async function getCurrentUser(): Promise<User> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getUsers(): Promise<User[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getUserById(id: string): Promise<User | undefined> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

// Project data functions
export async function getProjects(): Promise<Project[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getProjectsLedByUserId(userId: string): Promise<Project[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getProjectsMembershipByUserId(userId: string): Promise<Project[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

// Task data functions
export async function getTasks(): Promise<Task[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getTasksByAssignee(userId: string): Promise<Task[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

// Resource data functions
export async function getResources(): Promise<Resource[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getResourceById(id: string): Promise<Resource | undefined> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}

export async function getResourcesByProjectId(projectId: string): Promise<Resource[]> {
  throw new Error(BACKEND_NOT_IMPLEMENTED);
}
