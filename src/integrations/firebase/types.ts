import { Timestamp } from 'firebase/firestore';

// ── Enums ──────────────────────────────────────────────────────────────────────
export type Category = 'academic' | 'examinations' | 'placements' | 'events' | 'announcements' | 'achievements' | 'other';
export type Priority = 'high' | 'medium' | 'low';
export type Template = 'standard' | 'split' | 'full-image' | 'text-only' | 'featured';
export type TemplatePlacement = 'left' | 'right';

// ── Firestore document shapes ──────────────────────────────────────────────────

/** Shape stored in Firestore `notices` collection */
export interface FirestoreNotice {
    title: string;
    description: string;
    category: Category;
    customCategory?: string;
    priority: Priority;
    template: Template;
    templatePlacement?: TemplatePlacement;
    facultyName: string;
    facultyId: string;
    imageUrl?: string;
    documentUrl?: string;
    registrationUrl?: string;
    pdfOrientation?: 'landscape' | 'portrait';
    startTime: Timestamp;
    endTime: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isArchived: boolean;
    isDraft?: boolean;
    showIssuedBy?: boolean;
    showValidTill?: boolean;
    showTextOverlay?: boolean;
}

/** Shape stored in Firestore `profiles` collection */
export interface FirestoreProfile {
    name: string;
    department: string;
    email: string;
    phone?: string;
    profilePhotoUrl?: string;
    role: 'faculty' | 'admin';
    /** pending = awaiting admin approval, approved = can log in, rejected = denied */
    status?: 'pending' | 'approved' | 'rejected';
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
    templatePlacement?: TemplatePlacement;
    facultyName: string;
    facultyId: string;
    imageUrl?: string;
    documentUrl?: string;
    registrationUrl?: string;
    pdfOrientation?: 'landscape' | 'portrait';
    startTime: Date;
    endTime: Date;
    createdAt: Date;
    updatedAt: Date;
    isArchived: boolean;
    isDraft?: boolean;
    showIssuedBy?: boolean;
    showValidTill?: boolean;
    showTextOverlay?: boolean;
}

export interface Faculty {
    id: string;
    name: string;
    department: string;
    email: string;
    phone?: string;
    profilePhotoUrl?: string;
    role: 'faculty' | 'admin';
    status?: 'pending' | 'approved' | 'rejected';
}

export interface AuthState {
    isAuthenticated: boolean;
    faculty: Faculty | null;
    loading: boolean;
}
