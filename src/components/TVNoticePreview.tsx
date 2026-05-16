import React from 'react';
import { Notice, Template, type CustomLayoutConfig, type LayoutBox } from '@/integrations/firebase/types';
import { categoryConfig } from '@/config/categoryConfig';
import {
    FileText,
    Sparkles,
    Trophy,
    User,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TV_BRAND, TV_BRAND_CN } from '@/config/tvBrandTheme';
import { format } from 'date-fns';
import { AutoScrollText } from '@/components/AutoScrollText';
import { QRCodeSVG } from 'qrcode.react';
import { useTVDisplaySettings } from '@/hooks/useTVDisplaySettings';

import { isPdfUrl, toDisplayImageUrl } from '@/lib/mediaUtils';

// ── Shared media panel renderer ────────────────────────────────────────────────

interface MediaPanelProps {
    imageUrl?: string;
    documentUrl?: string;
    className?: string;
    fit?: 'cover' | 'contain';
}

/**
 * Renders a Drive image or PDF as a thumbnail image.
 * Using the /thumbnail endpoint avoids Google's virus-scan interstitial page
 * that breaks <img src="uc?export=view"> for larger files.
 * The thumbnail API also works for PDFs — it returns a PNG of the first page.
 */
export const MediaPanel: React.FC<MediaPanelProps> = ({ imageUrl, documentUrl, className = '', fit = 'cover' }) => {
    // Prefer the explicit image; fall back to document (PDF first-page thumbnail)
    const effectiveUrl = imageUrl || documentUrl || null;
    if (!effectiveUrl) return null;

    const isPdf = isPdfUrl(effectiveUrl) || (!imageUrl && !!documentUrl);
    // toDisplayImageUrl handles Cloudinary images, Cloudinary PDFs, and Drive URLs
    const src = toDisplayImageUrl(effectiveUrl);

    const renderContent = () => {
        const isDriveUrl = effectiveUrl.includes('drive.google.com') || effectiveUrl.includes('docs.google.com');
        if (isPdf && isDriveUrl) {
            const idMatch = effectiveUrl.match(/[?&]id=([a-zA-Z0-9_-]{20,})/) || effectiveUrl.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
            if (idMatch) {
                return (
                    // Negative-offset wrapper crops out Google Drive's top toolbar
                    // and stretches the PDF to fill the container edge-to-edge.
                    <div className="absolute inset-0 overflow-hidden bg-white">
                        <iframe
                            src={`https://drive.google.com/file/d/${idMatch[1]}/preview`}
                            className="absolute border-0 bg-white"
                            style={{
                                top:    '-00px',
                                left:   '-1%',
                                width:  '102%',
                                height: 'calc(100% + 108px)',
                            }}
                            title="PDF Preview"
                        />
                    </div>
                );
            }
        }

        return (
            <>
                <img
                    src={src}
                    className="absolute inset-0 w-full h-full object-cover blur-[30px] opacity-40 scale-110 pointer-events-none"
                    alt=""
                    aria-hidden="true"
                />
                <img
                src={src}
                className={cn('relative z-10 w-full h-full', fit === 'cover' ? 'object-cover' : 'object-contain')}
                alt=""
                onError={(e) => {
                    // thumbnail failed → try the raw Drive URL as last resort
                    const img = e.currentTarget;
                    if (img.src !== effectiveUrl) img.src = effectiveUrl;
                }}
            />
            </>
        );
    };

    return (
        <div className={cn('relative overflow-hidden bg-slate-900', className, isPdf && '[border-radius:0!important]')}>
            {renderContent()}
            {isPdf && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white font-black text-sm px-4 py-2 rounded-full shadow-xl pointer-events-none">
                    <FileText className="h-4 w-4" />
                    PDF
                </div>
            )}
        </div>
    );
};

interface TVNoticePreviewProps {
    notice: Partial<Notice>;
    isHero?: boolean;
    isLight?: boolean;
}

const DEFAULT_CUSTOM_LAYOUT: CustomLayoutConfig = {
    title: { x: 5, y: 7, w: 54, h: 18 },
    description: { x: 5, y: 29, w: 54, h: 54 },
    media: { x: 63, y: 10, w: 30, h: 46 },
    qr: { x: 74, y: 62, w: 14, h: 20 },
    titleSize: 62,
    descriptionSize: 30,
    showMedia: true,
    showQr: true,
};

const boxStyle = (box: LayoutBox): React.CSSProperties => ({
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.w}%`,
    height: `${box.h}%`,
});

export const TVNoticePreview: React.FC<TVNoticePreviewProps> = ({ notice, isHero = true, isLight = false }) => {
    const category = notice.category || 'other';
    const config = categoryConfig[category] || categoryConfig.other;
    const CategoryIcon = config.icon;
    const template: Template = notice.template as Template || 'standard';
    const placement = notice.templatePlacement || 'left';
    
    const { settings } = useTVDisplaySettings();
    const globalFontScale = (settings.tvFontScalePercent || 100) / 100;

    // Per-notice text scale factor (0.8 - 1.5, default 1.0)
    const scale = (notice.textScale ?? 1.0) * globalFontScale;

    // ── Adaptive title font size ────────────────────────────────────────
    const titleLen = (notice.title || '').length;
    const baseTitleRem = isHero ? (
        titleLen > 100 ? 2.4 :
            titleLen > 70 ? 2.8 :
                titleLen > 45 ? 3.4 :
                    4.2
    ) : (
        titleLen > 100 ? 1.6 :
            titleLen > 70 ? 1.8 :
                titleLen > 45 ? 2.0 :
                    2.4
    );
    const scaledTitle = baseTitleRem * scale;
    const titleStyle: React.CSSProperties = { fontSize: `clamp(1rem, ${(scaledTitle * 0.833).toFixed(2)}vw, ${scaledTitle.toFixed(2)}rem)` };

    // ── Description font size ───────────────────────────────────────────
    const baseDescRem = isHero ? 1.35 : 1.3;
    const scaledDesc = baseDescRem * scale;
    const descStyle: React.CSSProperties = { fontSize: `clamp(0.75rem, ${(scaledDesc * 0.833).toFixed(2)}vw, ${scaledDesc.toFixed(2)}rem)` };

    // Badges moved to footer
    const badges = (
        <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
            <div
                className="flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-white font-bold text-[10px] sm:text-xs"
                style={{ backgroundColor: config.accent }}
            >
                <CategoryIcon className="h-3 w-3 xl:h-4 xl:w-4" />
                {notice.customCategory || config.label}
            </div>
            {notice.priority === 'high' && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full font-black text-rose-500 border-2 border-rose-500 text-[10px] sm:text-xs">
                    <Zap className="h-3 w-3 xl:h-4 xl:w-4 fill-rose-500" />
                    URGENT
                </div>
            )}
        </div>
    );

    const showIssuedBy = notice.showIssuedBy !== false;
    const showValidTill = notice.showValidTill !== false;
    const hasFooter = showIssuedBy || showValidTill;
    const regUrl = notice.registrationUrl;

    // Always render footer now since it holds badges (made ultra-compact single line to maximize space)
    const footer = (
        <div className={`mt-auto pt-1.5 border-t ${isLight ? 'border-[#003366]/25' : 'border-white/5'} flex items-center justify-between shrink-0 gap-4`}>
            <div className="flex items-center gap-3 sm:gap-4 xl:gap-5 min-w-0">
                {showIssuedBy && (
                    <div className="flex items-center gap-1.5 shrink-0">
                        <User className={`h-3.5 w-3.5 ${isLight ? 'text-[#003366]/60' : 'text-slate-400'}`} />
                        <span className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-[#003366]' : 'text-slate-300'}`}>
                            By <span className="font-bold">{notice.facultyName || 'Faculty'}</span>
                        </span>
                    </div>
                )}
                {showIssuedBy && <span className={isLight ? 'text-[#003366]/20' : 'text-white/10'}>&bull;</span>}
                {badges}
            </div>
            {showValidTill && notice.endTime ? (
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-black ${isLight ? 'text-[#003366]/50' : 'text-slate-500'}`}>Until:</span>
                    <span className={`text-[11px] sm:text-xs font-black ${isLight ? 'text-[#F15A24]' : 'text-white'}`}>
                        {format(new Date(notice.endTime), 'dd MMM yyyy')}
                    </span>
                </div>
            ) : <div />}
        </div>
    );

    const containerClass = cn(
        "h-full w-full font-sans",
        isLight ? TV_BRAND_CN.navy : 'text-white',
        !isHero && "p-1.5 sm:p-2 xl:p-3"
    );

    // Achievement notices — poster-style (light) vs gold cinematic (dark)
    if (category === 'achievements') {
        if (isLight) {
            return (
                <div className={containerClass}>
                    <div className={cn(
                        'h-full rounded-xl sm:rounded-2xl xl:rounded-[2.5rem] relative overflow-hidden border-2 bg-white shadow-[0_24px_60px_rgba(0,51,102,0.08)]',
                        TV_BRAND_CN.borderNavyStrong
                    )}>
                        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                            style={{ background: `radial-gradient(circle at 30% 20%, ${TV_BRAND.navy}, transparent 55%)` }} />
                        <Trophy className="absolute right-4 sm:right-10 xl:right-16 top-1/2 -translate-y-1/2 h-28 sm:h-44 xl:h-52 w-28 sm:w-44 xl:w-52 text-[#003366] pointer-events-none select-none" />
                        <div className="relative z-10 h-full flex flex-col p-2.5 sm:p-4 xl:p-6">
                            <div className="flex items-center gap-2 sm:gap-3 xl:gap-4 shrink-0 mb-2 sm:mb-3 xl:mb-4">
                                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full border-2 border-[#003366]/25 bg-[#F15A24]/10">
                                    <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#F15A24]" />
                                    <span className={`${TV_BRAND_CN.navy} font-black uppercase tracking-widest text-[10px] sm:text-xs`}>Achievement</span>
                                </div>
                            </div>
                            <div className="flex-1 flex min-h-0 flex-row items-center gap-6 xl:gap-8">
                                <div className="flex-1 flex flex-col justify-center min-h-0">
                                    <h1 className={`font-black italic leading-[1.0] tracking-tight mb-1 sm:mb-1.5 xl:mb-2 ${TV_BRAND_CN.orange}`}
                                        style={titleStyle}>
                                        {notice.title || 'Achievement'}
                                    </h1>
                                    <div className="w-10 sm:w-14 xl:w-20 h-[3px] rounded-full bg-[#F15A24] mb-2 sm:mb-2.5 xl:mb-3" />
                                    {notice.description && (
                                        <div className="flex-1 min-h-0 overflow-hidden relative">
                                            <AutoScrollText
                                                className={`${TV_BRAND_CN.navy} leading-relaxed font-semibold italic`}
                                                content={notice.description}
                                                style={descStyle}
                                            />
                                        </div>
                                    )}
                                </div>
                                {notice.imageUrl && (
                                    <div className={cn(
                                        'w-[35%] max-h-[85%] shrink-0 overflow-hidden rounded-2xl border-2 shadow-lg',
                                        TV_BRAND_CN.borderNavyStrong
                                    )}
                                        style={{ aspectRatio: '4 / 3' }}>
                                        <MediaPanel
                                            imageUrl={notice.imageUrl}
                                            className="h-full w-full bg-[#F8FAFC]"
                                            fit="cover"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className={cn('flex items-center justify-between gap-4 shrink-0 pt-1.5 border-t', TV_BRAND_CN.borderNavy)}>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <User className="h-3.5 w-3.5 text-[#003366]/50" />
                                    <span className="text-[11px] sm:text-xs font-medium text-[#003366]">
                                        By <span className="font-bold">{notice.facultyName || 'Faculty'}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {notice.endTime && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-[#003366]/50">Until:</span>
                                            <p className={`text-[11px] sm:text-xs font-black ${TV_BRAND_CN.orange}`}>
                                                {format(new Date(notice.endTime), 'dd MMM yyyy')}
                                            </p>
                                        </div>
                                    )}
                                    {regUrl && (
                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                            <div className="rounded-lg bg-white p-1.5 sm:p-2 shadow-xl border border-[#003366]/20">
                                                <QRCodeSVG value={regUrl} size={80} includeMargin={false} />
                                            </div>
                                            <p className="text-[8px] sm:text-[9px] xl:text-[10px] font-black uppercase tracking-wider text-[#F15A24]">Scan to Register</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className={containerClass}>
                <div className="h-full rounded-xl sm:rounded-2xl xl:rounded-[2.5rem] relative overflow-hidden border border-yellow-400/20"
                    style={{ background: 'linear-gradient(135deg, #1a1200 0%, #0f0a00 60%, #12100a 100%)' }}>
                    {/* Radial glow top-center */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse 70% 55% at 40% 40%, rgba(250,204,21,0.1) 0%, transparent 70%)' }} />
                    {/* Trophy watermark — centered right half */}
                    <Trophy className="absolute right-4 sm:right-10 xl:right-20 top-1/2 -translate-y-1/2 h-32 sm:h-52 xl:h-[26rem] w-32 sm:w-52 xl:w-[26rem] text-yellow-400/[0.07] pointer-events-none select-none" />
                    <div className="relative z-10 h-full flex flex-col p-2.5 sm:p-4 xl:p-6">
                        {/* Top badge */}
                        <div className="flex items-center gap-2 sm:gap-3 xl:gap-4 shrink-0 mb-2 sm:mb-3 xl:mb-4">
                            <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 px-3 sm:px-4 xl:px-5 py-0.5 sm:py-1 rounded-full border border-yellow-400/30 bg-yellow-400/10">
                                <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5 xl:h-4 xl:w-4 text-yellow-400" />
                                <span className="text-yellow-400 font-black uppercase tracking-widest text-[10px] sm:text-xs">Achievement</span>
                            </div>
                        </div>
                        {/* Main content — takes remaining space */}
                        <div className="flex-1 flex min-h-0 flex-row items-center gap-6 xl:gap-8">
                            <div className="flex-1 flex flex-col justify-center min-h-0">
                            <h1 className="font-black text-white leading-[1.0] tracking-tight mb-1 sm:mb-1.5 xl:mb-2"
                                style={{ ...titleStyle, textShadow: '0 0 80px rgba(250,204,21,0.2)' }}>
                                {notice.title || 'Achievement'}
                            </h1>
                            <div className="w-10 sm:w-14 xl:w-20 h-[2px] xl:h-[3px] rounded-full bg-yellow-400/60 mb-2 sm:mb-2.5 xl:mb-3" />
                            {notice.description && (
                                <div className="flex-1 min-h-0 overflow-hidden relative">
                                    <AutoScrollText
                                        className="text-yellow-100/80 leading-relaxed font-medium"
                                        content={notice.description}
                                        style={descStyle}
                                    />
                                </div>
                            )}
                            </div>
                            {notice.imageUrl && (
                                <div className="w-[35%] max-h-[85%] shrink-0 overflow-hidden rounded-[1.75rem] border border-yellow-400/20 shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
                                    style={{ aspectRatio: '4 / 3' }}>
                                    <MediaPanel
                                        imageUrl={notice.imageUrl}
                                        className="h-full w-full bg-[#120c02]"
                                        fit="cover"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-4 shrink-0 pt-1.5 border-t border-yellow-400/10">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <User className="h-3.5 w-3.5 text-yellow-400/60" />
                                <span className="text-[11px] sm:text-xs font-medium text-white/80">
                                    By <span className="font-bold text-yellow-400">{notice.facultyName || 'Faculty'}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {notice.endTime && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-yellow-400/45">Until:</span>
                                        <p className="text-[11px] sm:text-xs font-bold text-white">
                                            {format(new Date(notice.endTime), 'dd MMM yyyy')}
                                        </p>
                                    </div>
                                )}
                                {regUrl && (
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        <div className="rounded-lg bg-white p-1.5 sm:p-2 shadow-2xl">
                                            <QRCodeSVG value={regUrl} size={80} includeMargin={false} />
                                        </div>
                                        <p className="text-[8px] sm:text-[9px] xl:text-[10px] font-black uppercase tracking-wider text-yellow-400/60">Scan to Register</p>
                                    </div>
                                )}
                            </div>
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
            const hasMedia = !!(notice.imageUrl || notice.documentUrl);
            return (
                <div className={containerClass}>
                    <div className="h-full flex gap-8">
                        {/* Text side — takes remaining width */}
                        <div className={cn("flex-1 flex flex-col h-full py-2 min-h-0", isRight && "order-2")}>

                            <h1 className={`font-black ${isLight ? 'italic text-[#F15A24]' : 'text-white'} leading-[1] tracking-tight mb-3 xl:mb-5 shrink-0 line-clamp-3`}
                                style={titleStyle}>
                                {notice.title || 'Notice Title'}
                            </h1>
                            <div className="flex-1 overflow-hidden min-h-0 relative">
                                <AutoScrollText
                                    className={`${isLight ? 'text-[#003366] font-medium' : 'text-slate-400'} leading-relaxed`}
                                    content={notice.description || 'Notice description goes here.'}
                                    style={descStyle}
                                />
                            </div>
                            {footer}
                        </div>
                        {/* Media side — fixed width, stretches full height */}
                        <div className={cn("w-[42%] shrink-0 py-4", isRight && "order-1")}>
                            {hasMedia ? (
                                <MediaPanel
                                    imageUrl={notice.imageUrl}
                                    documentUrl={notice.documentUrl}
                                    className={`h-full w-full rounded-[2rem] border ${isLight ? 'border-[#003366]/40 shadow-[0_12px_40px_rgba(0,51,102,0.12)]' : 'border-white/10'} shadow-2xl`}
                                    fit="cover"
                                />
                            ) : (
                                <div className={`h-full rounded-[2rem] ${isLight ? 'bg-[#F8FAFC] border-[#003366]/25' : 'bg-white/5 border-white/10'} border border-dashed flex items-center justify-center`}>
                                    <FileText className={`h-32 w-32 ${isLight ? 'text-[#003366]/10' : 'text-white/5'}`} />
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
                    <div className={`relative h-full w-full rounded-[3rem] overflow-hidden border ${isLight ? 'border-[#003366]/35' : 'border-white/5'}`}>
                        {(notice.imageUrl || notice.documentUrl) ? (
                            <MediaPanel
                                imageUrl={notice.imageUrl}
                                documentUrl={notice.documentUrl}
                                className="absolute inset-0 w-full h-full"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                <Sparkles className="h-32 w-32 text-white/5" />
                            </div>
                        )}
                        {notice.showTextOverlay !== false && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 xl:p-14 flex flex-col items-start">
                                    <div className="px-3 sm:px-4 xl:px-6 py-1 sm:py-1.5 xl:py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white font-bold text-xs sm:text-sm xl:text-base mb-3 sm:mb-5 xl:mb-8">
                                        {notice.customCategory || config.label}
                                    </div>
                                    <h1 className={`font-bold text-white leading-tight mb-2 xl:mb-4 drop-shadow-xl line-clamp-3`}
                                        style={titleStyle}>
                                        {notice.title || 'Notice Title'}
                                    </h1>
                                    <div className="max-h-20 sm:max-h-32 xl:max-h-48 overflow-hidden w-full relative">
                                        <AutoScrollText
                                            className="text-slate-200 leading-relaxed max-w-4xl drop-shadow-lg"
                                            content={notice.description || 'Notice description goes here...'}
                                            style={descStyle}
                                        />
                                    </div>
                                    <div className="mt-4 sm:mt-8 xl:mt-12 flex items-center gap-4 sm:gap-6 xl:gap-10 w-full justify-between">
                                        <div className="flex items-center gap-3 sm:gap-6 xl:gap-10">
                                            <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3">
                                                <User className="h-4 w-4 sm:h-5 sm:w-5 xl:h-6 xl:w-6 text-white/60" />
                                                <span className="text-sm sm:text-lg xl:text-2xl font-bold text-white">{notice.facultyName || 'Faculty Name'}</span>
                                            </div>
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/20" />
                                            <span className="text-sm sm:text-lg xl:text-2xl font-bold text-white/80">
                                                {notice.endTime ? format(new Date(notice.endTime), 'dd MMMM') : 'DD MMMM'}
                                            </span>
                                        </div>
                                        {regUrl && (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="rounded-lg bg-white p-1.5 sm:p-2 shadow-2xl">
                                                    <QRCodeSVG value={regUrl} size={80} includeMargin={false} />
                                                </div>
                                                <p className="text-[9px] sm:text-[10px] xl:text-[11px] font-black uppercase tracking-wider text-white/70">Scan to Register</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );

        case 'text-only':
            return (
                <div className={containerClass}>
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-6xl mx-auto py-4 sm:py-6 xl:py-10">

                        <h1 className={`font-bold ${isLight ? 'italic text-[#F15A24]' : 'text-white'} leading-[1] tracking-tight mb-4 sm:mb-6 xl:mb-10 shrink-0 line-clamp-3`}
                            style={titleStyle}>
                            {notice.title || 'Notice Title'}
                        </h1>
                        <div className="w-16 sm:w-24 xl:w-32 h-0.5 xl:h-1 mb-4 sm:mb-8 xl:mb-12 shrink-0" style={{ backgroundColor: isLight ? TV_BRAND.orange : config.accent }} />
                        <div className="w-full flex-1 min-h-0 max-w-5xl overflow-hidden relative">
                            <AutoScrollText
                                className={`${isLight ? 'text-[#003366] font-medium' : 'text-slate-400'} leading-[1.4] mx-auto text-center`}
                                content={notice.description || 'Notice description goes here in large text...'}
                                style={descStyle}
                            />
                        </div>
                        <div className={`mt-4 sm:mt-5 xl:mt-6 flex items-center gap-4 sm:gap-6 xl:gap-10 ${isLight ? 'text-[#003366]/70' : 'text-slate-500'} font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs xl:text-base shrink-0`}>
                            <span>{notice.facultyName || 'Faculty Name'}</span>
                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLight ? 'bg-[#F15A24]/50' : 'bg-white/10'}`} />
                            <span>{notice.endTime ? format(new Date(notice.endTime), 'dd MMM yyyy') : 'DD MMM YYYY'}</span>
                        </div>
                        {regUrl && (
                            <div className="mt-2 sm:mt-3 xl:mt-4 flex flex-col items-center gap-1 sm:gap-1.5 shrink-0">
                                <div className="rounded-lg bg-white p-1.5 sm:p-2 shadow-2xl border border-white/10">
                                    <QRCodeSVG value={regUrl} size={64} includeMargin={false} />
                                </div>
                                <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-[#F15A24]' : 'text-primary'}`}>Scan to Register</p>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'custom': {
            const layout = { ...DEFAULT_CUSTOM_LAYOUT, ...(notice.customLayout ?? {}) };
            return (
                <div className={containerClass}>
                    <div className={`relative h-full w-full rounded-[2.5rem] border overflow-hidden ${isLight ? 'border-[#003366]/35 bg-white' : 'border-white/10 bg-[#0b111f]'}`}>
                        <div className="absolute inset-0 pointer-events-none"
                            style={{ background: isLight ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' : 'linear-gradient(135deg, #0b1220 0%, #111a2b 100%)' }} />

                        <div className="absolute" style={boxStyle(layout.title)}>
                            <h1
                                className={cn(`font-black leading-[1.02] tracking-tight h-full overflow-hidden ${isLight ? 'italic text-[#F15A24]' : 'text-white'}`)}
                                style={{ fontSize: `clamp(22px, ${layout.titleSize * 0.65}px, ${layout.titleSize}px)` }}
                            >
                                {notice.title || 'Notice Title'}
                            </h1>
                        </div>

                        <div className="absolute overflow-hidden" style={{ ...boxStyle(layout.description), fontSize: `${Math.max(16, layout.descriptionSize)}px` }}>
                            <AutoScrollText
                                className={`${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}
                                content={notice.description || 'Notice description goes here...'}
                            />
                        </div>

                        {layout.showMedia && (notice.imageUrl || notice.documentUrl) && (
                            <div className={cn(
                                'absolute rounded-2xl overflow-hidden shadow-xl',
                                isLight ? 'border-2 border-[#003366]/35' : 'border border-white/10'
                            )} style={boxStyle(layout.media)}>
                                <MediaPanel
                                    imageUrl={notice.imageUrl}
                                    documentUrl={notice.documentUrl}
                                    className="w-full h-full"
                                    fit="cover"
                                />
                            </div>
                        )}

                        {layout.showQr && regUrl && (
                            <div className="absolute flex items-center justify-center" style={boxStyle(layout.qr)}>
                                <div className="rounded-xl bg-white p-2.5 shadow-2xl w-full h-full flex items-center justify-center">
                                    <QRCodeSVG value={regUrl} size={Math.max(70, Math.floor(100 * (layout.qr.w / 20)))} includeMargin={false} />
                                </div>
                            </div>
                        )}

                        <div className="absolute left-6 bottom-5 flex items-center gap-5">
                            {notice.category && (
                                <div className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white"
                                    style={{ backgroundColor: config.accent }}>
                                    {notice.customCategory || config.label}
                                </div>
                            )}
                            {notice.priority === 'high' && (
                                <div className="px-3 py-1 rounded-full text-[11px] font-black border border-rose-500 text-rose-500">URGENT</div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        case 'featured':
            return (
                <div className={containerClass}>
                    <div className={`h-full ${isLight ? 'bg-white border-[#003366]/30' : 'bg-white/5 border-white/10'} rounded-xl sm:rounded-2xl xl:rounded-[3rem] border-2 p-4 sm:p-8 xl:p-14 relative overflow-hidden text-left flex gap-8`}>
                        <div className="absolute top-0 right-0 p-4 sm:p-6 xl:p-10 pointer-events-none">
                            <Trophy className={cn('h-20 w-20 sm:h-28 sm:w-28 xl:h-40 xl:w-40 -rotate-12', isLight ? 'text-[#003366]/[0.07]' : 'text-white/5')} />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col min-h-0">
                            <div className={cn(
                                'font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-xs sm:text-sm xl:text-base mb-2 sm:mb-3 xl:mb-4 shrink-0',
                                isLight ? '' : 'text-primary'
                            )} style={isLight ? { color: TV_BRAND.orange } : undefined}>Featured Update</div>
                            <h1 className={`font-bold ${isLight ? 'italic text-[#F15A24]' : 'text-white'} mb-4 sm:mb-6 xl:mb-10 leading-tight shrink-0 line-clamp-3`}
                                style={titleStyle}>
                                {notice.title || 'Notice Title'}
                            </h1>
                            <div className="flex-1 overflow-hidden pr-2 sm:pr-5 xl:pr-10 min-h-0 relative">
                                <AutoScrollText
                                    className={`${isLight ? 'text-[#003366] font-medium' : 'text-slate-300'} leading-relaxed`}
                                    content={notice.description || 'Notice description goes here...'}
                                    style={descStyle}
                                />
                            </div>
                            <div className="mt-4 sm:mt-8 xl:mt-12 flex items-center gap-4 sm:gap-6 xl:gap-10">
                                <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 xl:w-14 xl:h-14 rounded-xl xl:rounded-2xl flex items-center justify-center shadow-lg shrink-0 text-white"
                                        style={{ backgroundColor: isLight ? TV_BRAND.navy : 'hsl(var(--primary))' }}>
                                        <User className="h-4 w-4 sm:h-5 sm:w-5 xl:h-8 xl:w-8" />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isLight ? 'text-[#003366]/55' : 'text-slate-500'}`}>Authorized By</p>
                                        <p className={`text-sm sm:text-lg xl:text-2xl font-bold ${isLight ? 'text-[#003366]' : 'text-white'}`}>{notice.facultyName || 'Faculty Name'}</p>
                                    </div>
                                </div>
                                {regUrl && (
                                    <div className="ml-auto flex flex-col items-center gap-1 shrink-0">
                                        <div className="rounded-xl bg-white p-1.5 sm:p-2 xl:p-2.5 shadow-2xl">
                                            <QRCodeSVG value={regUrl} size={80} includeMargin={false} />
                                        </div>
                                        <p className={`text-[9px] sm:text-[10px] xl:text-[11px] font-black uppercase tracking-wider ${isLight ? 'text-[#F15A24]' : 'text-primary'}`}>Scan to Register</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {(notice.imageUrl || notice.documentUrl) && (
                            <div className="relative z-10 w-[38%] shrink-0 h-full">
                                <MediaPanel
                                    imageUrl={notice.imageUrl}
                                    documentUrl={notice.documentUrl}
                                    className={`w-full h-full rounded-[2rem] shadow-2xl border ${isLight ? 'border-[#003366]/40' : 'border-white/10'}`}
                                    fit="cover"
                                />
                            </div>
                        )}
                    </div>
                </div>
            );

        default: {
            const isStandardRight = placement === 'right';
            const hasMedia = !!(notice.imageUrl || notice.documentUrl);
            const rightPanel = regUrl ? (
                <div className={cn(
                    'shrink-0 self-stretch flex flex-col items-center justify-center gap-5 py-8 px-6',
                    hasMedia ? 'w-[30%]' : 'w-[28%]',
                    isStandardRight && 'order-1'
                )}>
                    {hasMedia && (
                        <MediaPanel
                            imageUrl={notice.imageUrl}
                            documentUrl={notice.documentUrl}
                            className="w-full rounded-xl shadow-xl flex-1 min-h-0"
                            fit="cover"
                        />
                    )}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: config.accent }}>Scan to Register</p>
                        <div className="rounded-2xl bg-white p-2 shadow-[0_0_40px_rgba(255,255,255,0.12)]">
                            <QRCodeSVG value={regUrl} size={hasMedia ? 85 : 120} includeMargin={false} />
                        </div>
                        <p className="text-xs text-slate-500 text-center">Open registration link</p>
                    </div>
                </div>
            ) : hasMedia ? (
                <MediaPanel
                    imageUrl={notice.imageUrl}
                    documentUrl={notice.documentUrl}
                    className={cn('w-[38%] self-stretch rounded-[2rem] shadow-2xl shrink-0', isStandardRight && 'order-1')}
                    fit="cover"
                />
            ) : null;

            return (
                <div className={containerClass}>
                    <div className="h-full flex flex-col py-2 text-left">

                        <div className={cn('flex-1 min-h-0 flex items-start gap-12', isStandardRight && 'flex-row-reverse')}>
                            <div className="flex-1 flex flex-col min-h-0 h-full justify-center">
                                <h1 className={`font-black ${isLight ? 'italic text-[#F15A24]' : 'text-white'} leading-[1] tracking-tight mb-3 xl:mb-5 shrink-0 line-clamp-3`}
                                    style={titleStyle}>
                                    {notice.title || 'Notice Title'}
                                </h1>
                                <div className="flex-1 min-h-0 overflow-hidden relative">
                                    <AutoScrollText
                                        className={`${isLight ? 'text-[#003366] font-medium' : 'text-slate-400'} leading-relaxed`}
                                        content={notice.description || 'Notice description goes here...'}
                                        style={descStyle}
                                    />
                                </div>
                            </div>
                            {rightPanel}
                        </div>
                        {footer}
                    </div>
                </div>
            );
        }
    }
};
