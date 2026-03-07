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
import { format } from 'date-fns';
import { AutoScrollText } from '@/components/AutoScrollText';
import { QRCodeSVG } from 'qrcode.react';

// ── URL helpers ────────────────────────────────────────────────────────────────

/** True when the URL points to a PDF document. */
const isPdfUrl = (url: string) => {
    const u = url.toLowerCase();
    // Google Drive returns "uc?export=view&id=..." for images, but because we specify MIME types 
    // when uploading, Drive knows it's a PDF. We have to assume anything that's a direct Drive 
    // link could be a PDF if it doesn't explicitly look like a known image.
    // To be safe, any Drive link will trigger the thumbnail API anyway, which handles both safely.
    return u.includes('.pdf') || u.includes('export=download') || u.includes('export=view');
};

/**
 * Convert a storage URL to a displayable image URL.
 *
 * Handles three cases:
 *  1. Cloudinary image  → use as-is (already a direct image URL)
 *  2. Cloudinary PDF    → insert `f_jpg,pg_1` transformation to get first-page JPEG
 *  3. Google Drive URL  → use the thumbnail API (avoids virus-scan interstitial)
 *  4. Anything else     → use as-is
 */
function toDisplayImageUrl(url: string): string {
    // ── Cloudinary ──────────────────────────────────────────────────────────
    if (url.includes('res.cloudinary.com')) {
        if (isPdfUrl(url)) {
            // Insert transformation before the version/folder segment.
            // e.g. /image/upload/v123/... → /image/upload/f_jpg,pg_1/v123/...
            // Also works for /raw/upload/ → replace with /image/upload/
            return url
                .replace('/raw/upload/', '/image/upload/')
                .replace('/image/upload/', '/image/upload/f_jpg,pg_1/');
        }
        // Regular Cloudinary image — serve as-is
        return url;
    }

    // ── Google Drive ────────────────────────────────────────────────────────
    // Extract file ID from /uc?id=ID, /file/d/ID/view, /open?id=ID etc.
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/) ||
        url.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    if (idMatch) {
        // thumbnail endpoint works for both images and PDFs (first-page PNG)
        // and does NOT redirect to a virus-scan warning page
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1920`;
    }

    // ── base64 data URL or any other URL — use as-is ────────────────────────
    return url;
}

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
const MediaPanel: React.FC<MediaPanelProps> = ({ imageUrl, documentUrl, className = '', fit = 'cover' }) => {
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
            <img
                src={src}
                className={cn('w-full h-full', fit === 'cover' ? 'object-cover' : 'object-contain')}
                alt=""
                onError={(e) => {
                    // thumbnail failed → try the raw Drive URL as last resort
                    const img = e.currentTarget;
                    if (img.src !== effectiveUrl) img.src = effectiveUrl;
                }}
            />
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
    title: { x: 5, y: 7, w: 58, h: 20 },
    description: { x: 5, y: 30, w: 58, h: 52 },
    media: { x: 66, y: 7, w: 29, h: 56 },
    qr: { x: 72, y: 66, w: 18, h: 26 },
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
    const rawTemplate = notice.template as Template || 'standard';
    const template: Template = rawTemplate === 'featured' ? 'standard' : rawTemplate;
    const placement = notice.templatePlacement || 'left';

    // Adaptive title font size — shrinks for longer titles so description stays visible
    const titleLen = (notice.title || '').length;
    const titleSize =
        titleLen > 100 ? 'text-[2.6rem]' :
            titleLen > 70 ? 'text-[3.2rem]' :
                titleLen > 45 ? 'text-[4rem]' :
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

    const showIssuedBy = notice.showIssuedBy !== false;
    const showValidTill = notice.showValidTill !== false;
    const hasFooter = showIssuedBy || showValidTill;
    const regUrl = notice.registrationUrl;

    const qrBlock = regUrl ? (
        <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="rounded-xl bg-white p-3 shadow-2xl">
                <QRCodeSVG value={regUrl} size={160} includeMargin={false} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                Scan to Register
            </p>
        </div>
    ) : null;

    const footer = hasFooter ? (
        <div className={`mt-auto pt-8 border-t ${isLight ? 'border-slate-200' : 'border-white/5'} flex items-center justify-between shrink-0`}>
            {showIssuedBy ? (
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} flex items-center justify-center`}>
                        <User className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">Issued By</p>
                        <p className={`text-xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{notice.facultyName || 'Faculty Name'}</p>
                    </div>
                </div>
            ) : <div />}
            {showValidTill ? (
                <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">Valid Till</p>
                    <p className={`text-xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        {notice.endTime ? format(new Date(notice.endTime), 'dd MMM yyyy') : 'DD MMM YYYY'}
                    </p>
                </div>
            ) : <div />}
        </div>
    ) : null;

    const containerClass = cn(
        "h-full w-full font-sans",
        isLight ? 'text-slate-900' : 'text-white',
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
                    <div className="relative z-10 h-full flex flex-col p-10">
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
                            {regUrl && (
                                <div className="flex flex-col items-center gap-1">
                                    <div className="rounded-lg bg-white p-2 shadow-2xl">
                                        <QRCodeSVG value={regUrl} size={100} includeMargin={false} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-yellow-400/60">Scan to Register</p>
                                </div>
                            )}
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
            const hasMedia = !!(notice.imageUrl || notice.documentUrl);
            return (
                <div className={containerClass}>
                    <div className="h-full flex gap-8">
                        {/* Text side — takes remaining width */}
                        <div className={cn("flex-1 flex flex-col h-full py-6 min-h-0", isRight && "order-2")}>
                            {header}
                            <h1 className={cn(`font-bold ${isLight ? 'text-slate-900' : 'text-white'} leading-[1] tracking-tight mb-8 shrink-0 line-clamp-3`, titleSize)}>
                                {notice.title || 'Notice Title'}
                            </h1>
                            <div className="flex-1 overflow-hidden min-h-0 relative">
                                <AutoScrollText
                                    className={`text-3xl ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}
                                    content={notice.description || 'Notice description goes here.'}
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
                                    className={`h-full w-full rounded-[2rem] border ${isLight ? 'border-slate-200' : 'border-white/10'} shadow-2xl`}
                                />
                            ) : (
                                <div className={`h-full rounded-[2rem] ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'} border border-dashed flex items-center justify-center`}>
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
                    <div className={`relative h-full w-full rounded-[3rem] overflow-hidden border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
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
                                <div className="absolute inset-x-0 bottom-0 p-14 flex flex-col items-start">
                                    <div className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white font-bold mb-8">
                                        {notice.customCategory || config.label}
                                    </div>
                                    <h1 className={cn('font-bold text-white leading-tight mb-6 drop-shadow-xl line-clamp-3', titleSize)}>
                                        {notice.title || 'Notice Title'}
                                    </h1>
                                    <div className="max-h-48 overflow-hidden w-full relative">
                                        <AutoScrollText
                                            className="text-3xl text-slate-200 leading-relaxed max-w-4xl drop-shadow-lg"
                                            content={notice.description || 'Notice description goes here...'}
                                        />
                                    </div>
                                    <div className="mt-12 flex items-center gap-10 w-full justify-between">
                                        <div className="flex items-center gap-10">
                                            <div className="flex items-center gap-3">
                                                <User className="h-6 w-6 text-white/60" />
                                                <span className="text-2xl font-bold text-white">{notice.facultyName || 'Faculty Name'}</span>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-white/20" />
                                            <span className="text-2xl font-bold text-white/80">
                                                {notice.endTime ? format(new Date(notice.endTime), 'dd MMMM') : 'DD MMMM'}
                                            </span>
                                        </div>
                                        {regUrl && (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="rounded-lg bg-white p-2 shadow-2xl">
                                                    <QRCodeSVG value={regUrl} size={110} includeMargin={false} />
                                                </div>
                                                <p className="text-[11px] font-black uppercase tracking-wider text-white/70">Scan to Register</p>
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
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-6xl mx-auto py-10">
                        {header}
                        <h1 className={cn(`font-bold ${isLight ? 'text-slate-900' : 'text-white'} leading-[1] tracking-tight mb-10 shrink-0 line-clamp-3`, titleSize)}>
                            {notice.title || 'Notice Title'}
                        </h1>
                        <div className="w-32 h-1 mb-12 shrink-0" style={{ backgroundColor: config.accent }} />
                        <div className="w-full flex-1 min-h-0 max-w-5xl overflow-hidden relative">
                            <AutoScrollText
                                className={`text-[2.25rem] ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-[1.4] mx-auto text-center`}
                                content={notice.description || 'Notice description goes here in large text...'}
                            />
                        </div>
                        <div className={`mt-20 flex items-center gap-16 ${isLight ? 'text-slate-500' : 'text-slate-500'} font-bold uppercase tracking-[0.2em] text-lg shrink-0`}>
                            <span>{notice.facultyName || 'Faculty Name'}</span>
                            <div className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />
                            <span>{notice.endTime ? format(new Date(notice.endTime), 'dd MMM yyyy') : 'DD MMM YYYY'}</span>
                        </div>
                        {regUrl && (
                            <div className="mt-8 flex flex-col items-center gap-2 shrink-0">
                                <div className="rounded-xl bg-white p-3 shadow-2xl">
                                    <QRCodeSVG value={regUrl} size={140} includeMargin={false} />
                                </div>
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Scan to Register</p>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'custom': {
            const layout = { ...DEFAULT_CUSTOM_LAYOUT, ...(notice.customLayout ?? {}) };
            return (
                <div className={containerClass}>
                    <div className={`relative h-full w-full rounded-[2.5rem] border overflow-hidden ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#0b111f]'}`}>
                        <div className="absolute inset-0 pointer-events-none"
                            style={{ background: isLight ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' : 'linear-gradient(135deg, #0b1220 0%, #111a2b 100%)' }} />

                        <div className="absolute" style={boxStyle(layout.title)}>
                            <h1
                                className={cn(`font-black leading-[1.02] tracking-tight h-full overflow-hidden ${isLight ? 'text-slate-900' : 'text-white'}`)}
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
                            <div className="absolute rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={boxStyle(layout.media)}>
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
                                    <QRCodeSVG value={regUrl} size={Math.max(90, Math.floor(140 * (layout.qr.w / 20)))} includeMargin={false} />
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
                    <div className={`h-full ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'} rounded-[3rem] border p-14 relative overflow-hidden text-left`}>
                        <div className="absolute top-0 right-0 p-10">
                            <Trophy className="h-40 w-40 text-white/5 -rotate-12" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="text-primary font-black uppercase tracking-[0.4em] mb-4 shrink-0">Featured Update</div>
                            <h1 className={cn(`font-bold ${isLight ? 'text-slate-900' : 'text-white'} mb-10 leading-tight shrink-0 line-clamp-3`, titleSize)}>
                                {notice.title || 'Notice Title'}
                            </h1>
                            <div className="flex-1 overflow-hidden pr-10 min-h-0 relative">
                                <AutoScrollText
                                    className={`text-4xl ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}
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
                                        <p className={`text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{notice.facultyName || 'Faculty Name'}</p>
                                    </div>
                                </div>
                                {regUrl && (
                                    <div className="ml-auto flex flex-col items-center gap-1">
                                        <div className="rounded-xl bg-white p-2.5 shadow-2xl">
                                            <QRCodeSVG value={regUrl} size={120} includeMargin={false} />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-wider text-primary">Scan to Register</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );

        default: {
            const isStandardRight = placement === 'right';
            const hasMedia = !!(notice.imageUrl || notice.documentUrl);
            // When a QR exists and no media: right panel is the QR block.
            // When both exist: show media on right, QR tucked below it.
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
                        />
                    )}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: config.accent }}>Scan to Register</p>
                        <div className="rounded-2xl bg-white p-3 shadow-[0_0_40px_rgba(255,255,255,0.12)]">
                            <QRCodeSVG value={regUrl} size={hasMedia ? 140 : 200} includeMargin={false} />
                        </div>
                        <p className="text-xs text-slate-500 text-center">Open registration link</p>
                    </div>
                </div>
            ) : hasMedia ? (
                <MediaPanel
                    imageUrl={notice.imageUrl}
                    documentUrl={notice.documentUrl}
                    className={cn('w-[38%] self-stretch rounded-[2rem] shadow-2xl shrink-0', isStandardRight && 'order-1')}
                />
            ) : null;

            return (
                <div className={containerClass}>
                    <div className="h-full flex flex-col py-6 text-left">
                        {header}
                        <div className={cn('flex-1 min-h-0 flex items-start gap-12', isStandardRight && 'flex-row-reverse')}>
                            <div className="flex-1 flex flex-col min-h-0 h-full justify-center">
                                <h1 className={cn(`font-bold ${isLight ? 'text-slate-900' : 'text-white'} leading-[1] tracking-tight mb-8 shrink-0 line-clamp-3`, titleSize)}>
                                    {notice.title || 'Notice Title'}
                                </h1>
                                <div className="flex-1 min-h-0 overflow-hidden relative">
                                    <AutoScrollText
                                        className={`text-3xl ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}
                                        content={notice.description || 'Notice description goes here...'}
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
