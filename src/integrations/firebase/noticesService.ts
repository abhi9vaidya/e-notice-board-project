// crud operations for notices
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    Timestamp,
    onSnapshot,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import type { Notice, FirestoreNotice } from '@/integrations/firebase/types';

const NOTICES_COLLECTION = 'notices';

// ── Converters ────────────────────────────────────────────────────────────────

const toAppNotice = (id: string, data: FirestoreNotice): Notice => ({
    id,
    title: data.title,
    description: data.description,
    category: data.category,
    customCategory: data.customCategory,
    priority: data.priority,
    template: data.template,
    templatePlacement: data.templatePlacement,
    facultyName: data.facultyName,
    facultyId: data.facultyId,
    imageUrl: data.imageUrl,
    documentUrl: data.documentUrl,
    startTime: data.startTime.toDate(),
    endTime: data.endTime.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    isArchived: data.isArchived ?? false,
});

// ── Queries ────────────────────────────────────────────────────────────────────

// get active notices
export const getActiveNotices = async (): Promise<Notice[]> => {
    const now = Timestamp.now();
    const q = query(
        collection(db, NOTICES_COLLECTION),
        where('isArchived', '==', false),
        where('startTime', '<=', now),
        where('endTime', '>=', now),
        orderBy('startTime', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => toAppNotice(d.id, d.data() as FirestoreNotice));
};

// get achievements for tv display fallback
export const getActiveAchievements = async (): Promise<Notice[]> => {
    const q = query(
        collection(db, NOTICES_COLLECTION),
        where('category', '==', 'achievements'),
        where('isArchived', '==', false),
        orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => toAppNotice(d.id, d.data() as FirestoreNotice));
};

// get all notices for dashboard
export const getAllNotices = async (): Promise<Notice[]> => {
    const q = query(
        collection(db, NOTICES_COLLECTION),
        orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => toAppNotice(d.id, d.data() as FirestoreNotice));
};

// get notice by id
export const getNoticeById = async (id: string): Promise<Notice | null> => {
    const ref = doc(db, NOTICES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return toAppNotice(snap.id, snap.data() as FirestoreNotice);
};

// live listener for tv display
export const subscribeToActiveNotices = (
    callback: (notices: Notice[]) => void,
): Unsubscribe => {
    const now = Timestamp.now();
    const q = query(
        collection(db, NOTICES_COLLECTION),
        where('isArchived', '==', false),
        where('startTime', '<=', now),
        where('endTime', '>=', now),
        orderBy('startTime', 'desc'),
    );
    return onSnapshot(q, snapshot => {
        const notices = snapshot.docs.map(d => toAppNotice(d.id, d.data() as FirestoreNotice));
        callback(notices);
    });
};

// ── Mutations ─────────────────────────────────────────────────────────────────

export type CreateNoticeInput = Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>;

// create notice
export const createNotice = async (input: CreateNoticeInput): Promise<string> => {
    const now = Timestamp.now();
    const data: FirestoreNotice = {
        ...input,
        startTime: Timestamp.fromDate(input.startTime),
        endTime: Timestamp.fromDate(input.endTime),
        createdAt: now,
        updatedAt: now,
    };
    const ref = await addDoc(collection(db, NOTICES_COLLECTION), data);
    return ref.id;
};

// update notice
export const updateNotice = async (id: string, updates: Partial<CreateNoticeInput>): Promise<void> => {
    const ref = doc(db, NOTICES_COLLECTION, id);
    const data: Partial<FirestoreNotice> = {
        ...updates,
        ...(updates.startTime && { startTime: Timestamp.fromDate(updates.startTime) }),
        ...(updates.endTime && { endTime: Timestamp.fromDate(updates.endTime) }),
        updatedAt: Timestamp.now(),
    };
    await updateDoc(ref, data);
};

// archive notice (soft delete)
export const archiveNotice = async (id: string): Promise<void> => {
    const ref = doc(db, NOTICES_COLLECTION, id);
    await updateDoc(ref, { isArchived: true, updatedAt: Timestamp.now() });
};

// delete notice permanently
export const deleteNotice = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, NOTICES_COLLECTION, id));
};
