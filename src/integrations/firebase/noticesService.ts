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
    writeBatch,
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
    registrationUrl: data.registrationUrl,
    pdfOrientation: data.pdfOrientation,
    startTime: data.startTime.toDate(),
    endTime: data.endTime.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    isArchived: data.isArchived ?? false,
    showIssuedBy: data.showIssuedBy !== false,
    showValidTill: data.showValidTill !== false,
    showTextOverlay: data.showTextOverlay !== false,
});

// ── Queries ────────────────────────────────────────────────────────────────────

// get active notices
export const getActiveNotices = async (): Promise<Notice[]> => {
    const q = query(
        collection(db, NOTICES_COLLECTION),
        where('isArchived', '==', false)
    );
    const snapshot = await getDocs(q);
    const rawNotices = snapshot.docs.map(d => toAppNotice(d.id, d.data() as FirestoreNotice));

    const nowMs = Date.now();
    return rawNotices
        .filter(n => n.endTime.getTime() >= nowMs && n.startTime.getTime() <= nowMs)
        .sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
};

// get achievements for tv display fallback
export const getActiveAchievements = async (): Promise<Notice[]> => {
    const q = query(
        collection(db, NOTICES_COLLECTION),
        where('isArchived', '==', false)
    );
    const snapshot = await getDocs(q);
    const rawNotices = snapshot.docs.map(d => toAppNotice(d.id, d.data() as FirestoreNotice));

    return rawNotices
        .filter(n => n.category === 'achievements')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// get all notices for dashboard
export const getAllNotices = async (): Promise<Notice[]> => {
    const q = query(
        collection(db, NOTICES_COLLECTION),
        where('isArchived', '==', false) // only non-archived for dashboard
    );
    const snapshot = await getDocs(q);
    const rawNotices = snapshot.docs.map(d => toAppNotice(d.id, d.data() as FirestoreNotice));

    return rawNotices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// get all archived notices
export const getArchivedNotices = async (): Promise<Notice[]> => {
    const q = query(
        collection(db, NOTICES_COLLECTION),
        where('isArchived', '==', true)
    );
    const snapshot = await getDocs(q);
    const rawNotices = snapshot.docs.map(d => toAppNotice(d.id, d.data() as FirestoreNotice));

    return rawNotices.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
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
    onError?: (error: Error) => void
): Unsubscribe => {
    const q = query(
        collection(db, NOTICES_COLLECTION),
        where('isArchived', '==', false)
    );
    return onSnapshot(q,
        snapshot => {
            const rawNotices = snapshot.docs.map(d => toAppNotice(d.id, d.data() as FirestoreNotice));
            const nowMs = Date.now();

            const activeNotices = rawNotices
                .filter(n => n.endTime.getTime() >= nowMs && n.startTime.getTime() <= nowMs)
                .sort((a, b) => a.endTime.getTime() - b.endTime.getTime());

            callback(activeNotices);
        },
        error => {
            console.error("Error subscribing to active notices:", error);
            if (onError) onError(error);
        }
    );
};

// ── Mutations ─────────────────────────────────────────────────────────────────

export type CreateNoticeInput = Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>;
export interface AutoArchiveOptions {
    userId: string;
    isAdmin: boolean;
}

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

    // Explicitly remove any `undefined` values, as Firestore will throw an error
    const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    const data: Partial<FirestoreNotice> = {
        ...cleanUpdates,
        ...(cleanUpdates.startTime instanceof Date && { startTime: Timestamp.fromDate(cleanUpdates.startTime) }),
        ...(cleanUpdates.endTime instanceof Date && { endTime: Timestamp.fromDate(cleanUpdates.endTime) }),
        updatedAt: Timestamp.now(),
    };
    await updateDoc(ref, data);
};

// archive notice (soft delete)
export const archiveNotice = async (id: string): Promise<void> => {
    const ref = doc(db, NOTICES_COLLECTION, id);
    await updateDoc(ref, { isArchived: true, updatedAt: Timestamp.now() });
};

// archive expired notices that the current user is allowed to modify
export const autoArchiveExpiredNotices = async (options: AutoArchiveOptions): Promise<number> => {
    const now = Timestamp.now();
    const constraints = [
        where('isArchived', '==', false),
        where('endTime', '<=', now),
    ];

    if (!options.isAdmin) {
        constraints.push(where('facultyId', '==', options.userId));
    }

    const q = query(collection(db, NOTICES_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    if (snapshot.empty) return 0;

    let total = 0;
    const docs = snapshot.docs;
    const chunkSize = 400;

    for (let i = 0; i < docs.length; i += chunkSize) {
        const chunk = docs.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        const updatedAt = Timestamp.now();

        chunk.forEach((snap) => {
            batch.update(snap.ref, { isArchived: true, updatedAt });
            total += 1;
        });

        await batch.commit();
    }

    return total;
};

// delete notice permanently
export const deleteNotice = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, NOTICES_COLLECTION, id));
};
