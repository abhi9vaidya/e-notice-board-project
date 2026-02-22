import React from 'react';
import {
    GraduationCap,
    FileText,
    Briefcase,
    Sparkles,
    Megaphone,
    Trophy,
    MoreHorizontal
} from 'lucide-react';

export const categoryConfig: Record<string, { icon: React.ElementType; label: string; accent: string }> = {
    academic: { icon: GraduationCap, label: 'Academic', accent: '#3b82f6' },
    examinations: { icon: FileText, label: 'Examinations', accent: '#ef4444' },
    placements: { icon: Briefcase, label: 'Placements', accent: '#f59e0b' },
    events: { icon: Sparkles, label: 'Events', accent: '#8b5cf6' },
    announcements: { icon: Megaphone, label: 'Announcements', accent: '#10b981' },
    achievements: { icon: Trophy, label: 'Achievements', accent: '#facc15' },
    other: { icon: MoreHorizontal, label: 'Other', accent: '#64748b' },
};
