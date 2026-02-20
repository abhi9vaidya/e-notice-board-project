import { Timestamp } from 'firebase/firestore';

// ── Enums ──────────────────────────────────────────────────────────────────────
export type Category = 'placement' | 'academic' | 'project' | 'spiritual' | 'other';
export type Priority = 'high' | 'medium' | 'low';
export type Template = 'standard' | 'urgent' | 'minimal' | 'featured';

// ── Firestore document shapes ──────────────────────────────────────────────────

/** Shape stored in Firestore `notices` collection */
export interface FirestoreNotice {
    title: string;
    description: string;
    category: Category;
    customCategory?: string;
    priority: Priority;
    template: Template;
    facultyName: string;
    facultyId: string;
    imageUrl?: string;
    documentUrl?: string;
    startTime: Timestamp;
    endTime: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isArchived: boolean;
}

/** Shape stored in Firestore `profiles` collection */
export interface FirestoreProfile {
    name: string;
    department: string;
    email: string;
    phone?: string;
    profilePhotoUrl?: string;
    role: 'faculty' | 'admin';
    createdAt: Timestamp;
}

// ── App-level types (Timestamps converted to Date) ─────────────────────────────

export interface Notice {
    id: string;
    title: string;
    description: string;
    category: Category;
    customCategory?: string;
    priority: Priority;
    template: Template;
    facultyName: string;
    facultyId: string;
    imageUrl?: string;
    documentUrl?: string;
    startTime: Date;
    endTime: Date;
    createdAt: Date;
    updatedAt: Date;
    isArchived: boolean;
}

export interface Faculty {
    id: string;
    name: string;
    department: string;
    email: string;
    phone?: string;
    profilePhotoUrl?: string;
    role: 'faculty' | 'admin';
}

export interface AuthState {
    isAuthenticated: boolean;
    faculty: Faculty | null;
    loading: boolean;
}
