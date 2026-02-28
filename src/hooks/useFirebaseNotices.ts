// hooks for firestore notices
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    getAllNotices,
    getActiveNotices,
    createNotice,
    updateNotice,
    archiveNotice,
    deleteNotice,
    subscribeToActiveNotices,
    type CreateNoticeInput,
} from '@/integrations/firebase/noticesService';
import type { Notice, Category, Priority, Template, TemplatePlacement } from '@/integrations/firebase/types';

export interface NoticeFormData {
    title: string;
    description: string;
    category: Category;
    customCategory?: string;
    priority: Priority;
    template: Template;
    templatePlacement?: TemplatePlacement;
    facultyName: string;
    facultyId?: string;
    imageUrl?: string;
    documentUrl?: string;
    startTime: Date;
    endTime: Date;
}

// faculty notices hook

export const useNotices = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchNotices = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllNotices();
            setNotices(data);
        } catch (err) {
            console.error('Error fetching notices:', err);
            toast({ title: 'Error', description: 'Failed to load notices.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchNotices(); }, [fetchNotices]);

    const addNotice = async (input: CreateNoticeInput): Promise<boolean> => {
        try {
            await createNotice(input);
            toast({ title: 'Notice created', description: `"${input.title}" was added successfully.` });
            await fetchNotices();
            return true;
        } catch (err) {
            console.error('Error creating notice:', err);
            toast({ title: 'Error', description: 'Failed to create notice.', variant: 'destructive' });
            return false;
        }
    };

    const editNotice = async (id: string, updates: Partial<CreateNoticeInput>): Promise<boolean> => {
        try {
            await updateNotice(id, updates);
            toast({ title: 'Notice updated', description: 'Changes saved successfully.' });
            await fetchNotices();
            return true;
        } catch (err) {
            console.error('Error updating notice:', err);
            toast({ title: 'Error', description: 'Failed to update notice.', variant: 'destructive' });
            return false;
        }
    };

    const removeNotice = async (id: string, hard = false): Promise<boolean> => {
        try {
            if (hard) {
                await deleteNotice(id);
                toast({ title: 'Notice deleted', description: 'Notice permanently removed.' });
            } else {
                await archiveNotice(id);
                toast({ title: 'Notice archived', description: 'Notice moved to archive.' });
            }
            await fetchNotices();
            return true;
        } catch (err) {
            console.error('Error removing notice:', err);
            toast({ title: 'Error', description: 'Failed to remove notice.', variant: 'destructive' });
            return false;
        }
    };

    return { notices, loading, refetch: fetchNotices, addNotice, editNotice, removeNotice };
};

// tv notices hook (realtime)

export const useActiveNotices = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToActiveNotices(
            (data) => {
                setNotices(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error in useActiveNotices:", error);
                setNotices([]);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    return { notices, loading };
};

// achievements hook for fallback
import { getActiveAchievements } from '@/integrations/firebase/noticesService';

export const useActiveAchievements = () => {
    const [achievements, setAchievements] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAchievements = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getActiveAchievements();
            setAchievements(data);
        } catch (err) {
            console.error('Error fetching achievements:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);

    return { achievements, loading };
};
