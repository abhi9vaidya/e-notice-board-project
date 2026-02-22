import React from 'react';
import { Notice, Template } from '@/integrations/firebase/types';
import { categoryConfig } from '@/config/categoryConfig';
import {
    FileText,
    Sparkles,
    Trophy,
    User,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TVNoticePreviewProps {
    notice: Partial<Notice>;
    isHero?: boolean;
}

export const TVNoticePreview: React.FC<TVNoticePreviewProps> = ({ notice, isHero = true }) => {
    const category = notice.category || 'other';
    const config = categoryConfig[category] || categoryConfig.other;
    const CategoryIcon = config.icon;
    const template = notice.template as Template || 'standard';
    const placement = notice.templatePlacement || 'left';

    const header = (
        <div className="flex items-center gap-6 mb-12">
            <div
                className="flex items-center gap-3 px-6 py-2 rounded-full text-white font-bold text-lg"
                style={{ backgroundColor: config.accent }}
            >
                <CategoryIcon className="h-6 w-6" />
                {notice.customCategory || config.label}
            </div>
            {notice.priority === 'high' && (
                <div className="flex items-center gap-2 px-6 py-2 rounded-full font-black text-rose-500 border-2 border-rose-500">
                    <Zap className="h-6 w-6 fill-rose-500" />
                    URGENT
                </div>
            )}
        </div>
    );

    const footer = (
        <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <User className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">Issued By</p>
                    <p className="text-xl font-bold text-white">{notice.facultyName || 'Faculty Name'}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">Valid Till</p>
                <p className="text-xl font-bold text-white">
                    {notice.endTime ? format(new Date(notice.endTime), 'dd MMM yyyy') : 'DD MMM YYYY'}
                </p>
            </div>
        </div>
    );

    const containerClass = cn(
        "h-full w-full text-white font-sans",
        !isHero && "p-4"
    );

    switch (template) {
        case 'split': {
            const isRight = placement === 'right';
            return (
                <div className={containerClass}>
                    <div className="h-full grid grid-cols-5 gap-16">
                        <div className={cn("col-span-3 flex flex-col h-full py-6", isRight && "order-2")}>
                            {header}
                            <h1 className="text-[5.5rem] font-bold text-white leading-[1.05] tracking-tight mb-8">
                                {notice.title || 'Notice Title'}
                            </h1>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-3xl text-slate-400 leading-relaxed max-w-3xl">
                                    {notice.description || 'Notice description goes here and can be quite long to test the readability.'}
                                </p>
                            </div>
                            {footer}
                        </div>
                        <div className={cn("col-span-2 relative py-6", isRight && "order-1")}>
                            {notice.imageUrl ? (
                                <div className="h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl">
                                    <img src={notice.imageUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                            ) : (
                                <div className="h-full rounded-[2.5rem] bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                    <FileText className="h-32 w-32 text-white/5" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        case 'full-image':
            return (
                <div className={containerClass}>
                    <div className="relative h-full w-full rounded-[3rem] overflow-hidden border border-white/5">
                        {notice.imageUrl ? (
                            <img src={notice.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                <Sparkles className="h-32 w-32 text-white/5" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-20 flex flex-col items-start">
                            <div className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white font-bold mb-8">
                                {notice.customCategory || config.label}
                            </div>
                            <h1 className="text-8xl font-bold text-white leading-tight mb-6 drop-shadow-xl">
                                {notice.title || 'Notice Title'}
                            </h1>
                            <p className="text-3xl text-slate-200 leading-relaxed max-w-4xl drop-shadow-lg line-clamp-3">
                                {notice.description || 'Notice description goes here...'}
                            </p>
                            <div className="mt-12 flex items-center gap-10">
                                <div className="flex items-center gap-3">
                                    <User className="h-6 w-6 text-white/60" />
                                    <span className="text-2xl font-bold text-white">{notice.facultyName || 'Faculty Name'}</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                <span className="text-2xl font-bold text-white/80">
                                    {notice.endTime ? format(new Date(notice.endTime), 'dd MMMM') : 'DD MMMM'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'text-only':
            return (
                <div className={containerClass}>
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-6xl mx-auto py-10">
                        {header}
                        <h1 className="text-[6.5rem] font-bold text-white leading-[1] tracking-tight mb-12">
                            {notice.title || 'Notice Title'}
                        </h1>
                        <div className="w-32 h-1 mb-12" style={{ backgroundColor: config.accent }} />
                        <p className="text-[2.25rem] text-slate-400 leading-[1.4] max-w-5xl">
                            {notice.description || 'Notice description goes here in large text...'}
                        </p>
                        <div className="mt-20 flex items-center gap-16 text-slate-500 font-bold uppercase tracking-[0.2em] text-lg">
                            <span>{notice.facultyName || 'Faculty Name'}</span>
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                            <span>{notice.endTime ? format(new Date(notice.endTime), 'dd MMM yyyy') : 'DD MMM YYYY'}</span>
                        </div>
                    </div>
                </div>
            );

        case 'featured':
            return (
                <div className={containerClass}>
                    <div className="h-full bg-white/5 rounded-[3rem] border border-white/10 p-20 relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 p-10">
                            <Trophy className="h-40 w-40 text-white/5 -rotate-12" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="text-primary font-black uppercase tracking-[0.4em] mb-4">Featured Update</div>
                            <h1 className="text-8xl font-bold text-white mb-10 leading-tight">
                                {notice.title || 'Notice Title'}
                            </h1>
                            <div className="flex-1 overflow-hidden pr-10">
                                <p className="text-4xl text-slate-300 leading-relaxed">
                                    {notice.description || 'Notice description goes here...'}
                                </p>
                            </div>
                            <div className="mt-12 flex items-center gap-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg text-black">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Authorized By</p>
                                        <p className="text-2xl font-bold text-white">{notice.facultyName || 'Faculty Name'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

        default: {
            const isStandardRight = placement === 'right';
            return (
                <div className={containerClass}>
                    <div className="h-full flex flex-col py-6 text-left">
                        {header}
                        <div className={cn("flex-1 flex items-center gap-20", isStandardRight && "flex-row-reverse")}>
                            <div className="flex-1">
                                <h1 className="text-[6rem] font-bold text-white leading-[1] tracking-tight mb-10">
                                    {notice.title || 'Notice Title'}
                                </h1>
                                <p className="text-3xl text-slate-400 leading-relaxed max-w-4xl">
                                    {notice.description || 'Notice description goes here...'}
                                </p>
                            </div>
                            {notice.imageUrl && (
                                <div className="w-[30vw] aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shrink-0">
                                    <img src={notice.imageUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                            )}
                        </div>
                        {footer}
                    </div>
                </div>
            );
        }
    }
};
