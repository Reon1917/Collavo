export interface FilesViewProps {
  projectId: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  size?: number;
  uploadedBy: string;
  uploadedAt: string;
} 