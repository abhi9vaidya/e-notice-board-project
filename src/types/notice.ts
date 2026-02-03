// Notice types for the Faculty E-Notice Board
// TODO: Replace with Firebase types when integrating backend

export type Category = 'placement' | 'academic' | 'project' | 'spiritual' | 'other';
export type Priority = 'high' | 'medium' | 'low';
export type Template = 'standard' | 'urgent' | 'minimal' | 'featured';

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: Category;
  customCategory?: string; // For "other" category - user-defined category name
  priority: Priority;
  template: Template;
  facultyName: string;
  imageUrl?: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  faculty: Faculty | null;
}
