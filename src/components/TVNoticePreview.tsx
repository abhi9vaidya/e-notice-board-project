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
import { AutoScrollText } from '@/components/AutoScrollText';

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

    // Adaptive title font size — shrinks for longer titles so description stays visible
    const titleLen = (notice.title || '').length;
    const titleSize =
        titleLen > 100 ? 'text-[2.6rem]' :
        titleLen > 70  ? 'text-[3.2rem]' :
        titleLen > 45  ? 'text-[4rem]'   :
                         'text-[5.5rem]';

    const header = (
        <div className="flex items-center gap-6 mb-8 shrink-0">
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
        <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between shrink-0">
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

    // Achievement notices get their own gold treatment regardless of template
    if (category === 'achievements') {
        return (
            <div className={containerClass}>
                <div className="h-full rounded-[2.5rem] relative overflow-hidden border border-yellow-400/20"
                    style={{ background: 'linear-gradient(135deg, #1a1200 0%, #0f0a00 60%, #12100a 100%)' }}>
                    {/* Radial glow top-center */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse 70% 55% at 40% 40%, rgba(250,204,21,0.1) 0%, transparent 70%)' }} />
                    {/* Trophy watermark — centered right half */}
                    <Trophy className="absolute right-20 top-1/2 -translate-y-1/2 h-[26rem] w-[26rem] text-yellow-400/[0.07] pointer-events-none select-none" />
                    <div className="relative z-10 h-full flex flex-col p-14">
                        {/* Top badge */}
                        <div className="flex items-center gap-4 shrink-0 mb-10">
                            <div className="flex items-center gap-2.5 px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                <span className="text-yellow-400 font-black uppercase tracking-widest text-sm">Achievement</span>
                            </div>
                        </div>
                        {/* Main content — takes remaining space */}
                        <div className="flex-1 flex flex-col justify-center min-h-0">
                            <h1 className="text-[5.5rem] font-black text-white leading-[1.0] tracking-tight mb-5"
                                style={{ textShadow: '0 0 80px rgba(250,204,21,0.2)' }}>
                                {notice.title || 'Achievement'}
                            </h1>
                            <div className="w-20 h-[3px] rounded-full bg-yellow-400/60 mb-6" />
                            {notice.description && (
                                <div className="overflow-hidden max-h-40 relative">
                                    <AutoScrollText
                                        className="text-[1.6rem] text-yellow-100/80 leading-relaxed font-medium"
                                        content={notice.description}
                                    />
                                </div>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="flex items-center justify-between shrink-0 pt-6 border-t border-yellow-400/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-yellow-400/60" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest font-bold text-yellow-400/40">Issued By</p>
                                    <p className="text-lg font-bold text-white/80">{notice.facultyName || 'Faculty'}</p>
                                </div>
                            </div>
                            {notice.endTime && (
                                <p className="text-sm font-bold text-yellow-400/40 uppercase tracking-widest">
                                    {format(new Date(notice.endTime), 'dd MMM yyyy')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    switch (template) {
        // Urgent high-priority notices get a red pulse ring treatment added to the outer wrapper below
        case 'split': {
            const isRight = placement === 'right';
            return (
                <div className={containerClass}>
                    <div className="h-full grid grid-cols-5 gap-16">
                        <div className={cn("col-span-3 flex flex-col h-full py-6 min-h-0", isRight && "order-2")}>
                            {header}
                        <h1 className={cn("font-bold text-white leading-[1] tracking-tight mb-10 shrink-0 line-clamp-3", titleSize)}>
                                {notice.title || 'Notice Title'}
                            </h1>
                            <div className="flex-1 overflow-hidden min-h-0 relative">
                                <AutoScrollText
                                    className="text-3xl text-slate-400 leading-relaxed max-w-3xl"
                                    content={notice.description || 'Notice description goes here and can be quite long to test the readability.'}
                                />
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
                            <h1 className={cn("font-bold text-white leading-tight mb-6 drop-shadow-xl line-clamp-3", titleSize)}>
                                {notice.title || 'Notice Title'}
                            </h1>
                            <div className="max-h-48 overflow-hidden w-full relative">
                                <AutoScrollText
                                    className="text-3xl text-slate-200 leading-relaxed max-w-4xl drop-shadow-lg"
                                    content={notice.description || 'Notice description goes here...'}
                                />
                            </div>
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
                        <h1 className={cn("font-bold text-white leading-[1] tracking-tight mb-10 shrink-0 line-clamp-3", titleSize)}>
                            {notice.title || 'Notice Title'}
                        </h1>
                        <div className="w-32 h-1 mb-12 shrink-0" style={{ backgroundColor: config.accent }} />
                        <div className="w-full flex-1 min-h-0 max-w-5xl overflow-hidden relative">
                            <AutoScrollText
                                className="text-[2.25rem] text-slate-400 leading-[1.4] mx-auto text-center"
                                content={notice.description || 'Notice description goes here in large text...'}
                            />
                        </div>
                        <div className="mt-20 flex items-center gap-16 text-slate-500 font-bold uppercase tracking-[0.2em] text-lg shrink-0">
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
                            <div className="text-primary font-black uppercase tracking-[0.4em] mb-4 shrink-0">Featured Update</div>
                            <h1 className={cn("font-bold text-white mb-10 leading-tight shrink-0 line-clamp-3", titleSize)}>
                                {notice.title || 'Notice Title'}
                            </h1>
                            <div className="flex-1 overflow-hidden pr-10 min-h-0 relative">
                                <AutoScrollText
                                    className="text-4xl text-slate-300 leading-relaxed"
                                    content={notice.description || 'Notice description goes here...'}
                                />
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
                        <div className={cn("flex-1 min-h-0 flex items-center gap-20", isStandardRight && "flex-row-reverse")}>
                            <div className="flex-1 flex flex-col min-h-0 h-full justify-center">
                                <h1 className={cn("font-bold text-white leading-[1] tracking-tight mb-10 shrink-0 line-clamp-3", titleSize)}>
                                    {notice.title || 'Notice Title'}
                                </h1>
                                <div className="flex-1 min-h-0 overflow-hidden relative max-h-[400px]">
                                    <AutoScrollText
                                        className="text-3xl text-slate-400 leading-relaxed max-w-4xl"
                                        content={notice.description || 'Notice description goes here...'}
                                    />
                                </div>
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
