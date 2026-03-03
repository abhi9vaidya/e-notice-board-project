import React, { useState, useEffect, useRef } from 'react';
import { Notice, Category, Priority, Template, TemplatePlacement } from '@/integrations/firebase/types';
import { NoticeFormData } from '@/hooks/useFirebaseNotices';
import { useAuth } from '@/context/AuthContext';
import { categoryConfig } from '@/config/categoryConfig';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Upload, FileText, Loader2, X, ImagePlus, Zap, AlertTriangle,
  Minus, GalleryHorizontal, Image, AlignLeft, Sparkles,
  User, Clock, ChevronLeft, ChevronRight, Tv,
} from 'lucide-react';
import { toast } from 'sonner';
import { extractTextFromFile } from '@/lib/extractText';
import { QRCodeSVG } from 'qrcode.react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddEditNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoticeFormData) => void;
  editingNotice?: Notice | null;
}

type FormData = Omit<NoticeFormData, 'facultyName'>;

const defaultFormData: FormData = {
  title: '',
  description: '',
  category: 'academic',
  customCategory: '',
  priority: 'medium',
  template: 'standard',
  templatePlacement: 'left',
  imageUrl: '',
  documentUrl: '',
  registrationUrl: '',
  startTime: new Date(),
  endTime: addDays(new Date(), 1),
};

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITIES: { value: Priority; label: string; sub: string; color: string; bg: string; icon: React.ReactNode }[] = [
  {
    value: 'high',
    label: 'Urgent',
    sub: 'Alert style, shown on top',
    color: 'text-rose-600 border-rose-500',
    bg: 'bg-rose-500/10',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    value: 'medium',
    label: 'Important',
    sub: 'Standard mid-priority',
    color: 'text-amber-600 border-amber-500',
    bg: 'bg-amber-500/10',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    value: 'low',
    label: 'General',
    sub: 'Informational notice',
    color: 'text-sky-600 border-sky-500',
    bg: 'bg-sky-500/10',
    icon: <Minus className="h-4 w-4" />,
  },
];

// ─── Template config ──────────────────────────────────────────────────────────

const TEMPLATES: {
  value: Template;
  label: string;
  icon: React.ReactNode;
  hasPlacement: boolean;
  preview: React.ReactNode;
}[] = [
  {
    value: 'standard',
    label: 'Standard',
    icon: <FileText className="h-3.5 w-3.5" />,
    hasPlacement: false,
    preview: (
      <div className="flex flex-col gap-1 p-2 h-full">
        <div className="h-2 bg-current rounded w-3/4 opacity-60" />
        <div className="h-1.5 bg-current rounded w-full opacity-30 mt-1" />
        <div className="h-1.5 bg-current rounded w-5/6 opacity-30" />
        <div className="h-1.5 bg-current rounded w-4/6 opacity-30" />
      </div>
    ),
  },
  {
    value: 'split',
    label: 'Split',
    icon: <GalleryHorizontal className="h-3.5 w-3.5" />,
    hasPlacement: true,
    preview: (
      <div className="flex gap-1 p-2 h-full">
        <div className="w-1/2 bg-current rounded opacity-20" />
        <div className="flex-1 flex flex-col gap-1 justify-center">
          <div className="h-2 bg-current rounded opacity-60" />
          <div className="h-1.5 bg-current rounded opacity-30" />
          <div className="h-1.5 bg-current rounded w-3/4 opacity-30" />
        </div>
      </div>
    ),
  },
  {
    value: 'full-image',
    label: 'Full Image',
    icon: <Image className="h-3.5 w-3.5" />,
    hasPlacement: false,
    preview: (
      <div className="relative p-2 h-full flex items-end">
        <div className="absolute inset-0 bg-current opacity-20 rounded" />
        <div className="relative flex flex-col gap-1 w-full">
          <div className="h-2 bg-current rounded w-3/4 opacity-80" />
          <div className="h-1.5 bg-current rounded opacity-50" />
        </div>
      </div>
    ),
  },
  {
    value: 'text-only',
    label: 'Text Only',
    icon: <AlignLeft className="h-3.5 w-3.5" />,
    hasPlacement: false,
    preview: (
      <div className="flex flex-col gap-1.5 p-2 h-full justify-center">
        <div className="h-2.5 bg-current rounded w-2/3 opacity-70 mx-auto" />
        <div className="h-1.5 bg-current rounded opacity-30 mx-auto w-5/6" />
        <div className="h-1.5 bg-current rounded opacity-30 mx-auto w-4/6" />
        <div className="h-1.5 bg-current rounded opacity-30 mx-auto w-3/6" />
      </div>
    ),
  },
  {
    value: 'featured',
    label: 'Featured',
    icon: <Sparkles className="h-3.5 w-3.5" />,
    hasPlacement: false,
    preview: (
      <div className="flex flex-col gap-1 p-2 h-full">
        <div className="h-0.5 bg-current opacity-60 rounded mb-1" />
        <div className="h-3 bg-current rounded w-3/4 opacity-80" />
        <div className="h-1.5 bg-current rounded w-full opacity-30 mt-1" />
        <div className="h-1.5 bg-current rounded w-5/6 opacity-30" />
        <div className="h-0.5 bg-current opacity-60 rounded mt-1" />
      </div>
    ),
  },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

const fmtDTL = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

// ─── Mini TV Preview ──────────────────────────────────────────────────────────

interface MiniPreviewProps {
  formData: FormData & { showIssuedBy?: boolean; showValidTill?: boolean };
  facultyName: string;
}

const MiniPreview: React.FC<MiniPreviewProps> = ({ formData, facultyName }) => {
  const cat = formData.category || 'other';
  const cfg = categoryConfig[cat] || categoryConfig.other;
  const CatIcon = cfg.icon;
  const hasImage = !!(formData.imageUrl || formData.documentUrl);

  const imgEl = (cls = '') =>
    hasImage ? (
      <div className={cn('overflow-hidden bg-slate-800', cls)}>
        <img
          src={formData.imageUrl || formData.documentUrl}
          alt=""
          className="object-cover w-full h-full"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    ) : (
      <div className={cn('bg-slate-800/60 flex items-center justify-center', cls)}>
        <ImagePlus className="h-5 w-5 text-slate-600" />
      </div>
    );

  const badges = (
    <div className="flex flex-wrap items-center gap-1 mb-1">
      <span
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[8px] font-bold"
        style={{ backgroundColor: cfg.accent }}
      >
        <CatIcon className="h-2 w-2" />
        {formData.customCategory || cfg.label}
      </span>
      {formData.priority === 'high' && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-rose-400 border border-rose-500">
          <Zap className="h-2 w-2" /> URGENT
        </span>
      )}
    </div>
  );

  const titleEl = (
    <p className="text-white font-bold text-[11px] leading-tight line-clamp-2">
      {formData.title || <span className="opacity-40">Notice title…</span>}
    </p>
  );
  const descEl = (
    <p className="text-slate-300 text-[9px] leading-relaxed line-clamp-3 mt-0.5">
      {formData.description || <span className="opacity-40">Description…</span>}
    </p>
  );

  const textBlock = (
    <div className="flex-1 flex flex-col justify-center min-w-0 p-2.5">
      {badges}{titleEl}{descEl}
    </div>
  );

  const t = formData.template;

  const body = t === 'text-only' ? (
    <div className="flex-1 flex items-center justify-center px-3 py-2">
      <div className="w-full text-center">
        {badges}
        <p className="text-white font-bold text-[11px] leading-tight">{formData.title || <span className="opacity-40">Title…</span>}</p>
        <p className="text-slate-300 text-[9px] leading-snug mt-0.5 line-clamp-4">{formData.description || ''}</p>
      </div>
    </div>
  ) : t === 'full-image' ? (
    <div className="flex-1 relative overflow-hidden">
      {hasImage
        ? <img src={formData.imageUrl || formData.documentUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        : <div className="absolute inset-0 bg-slate-800 flex items-center justify-center"><ImagePlus className="h-7 w-7 text-slate-600" /></div>
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2">
        {badges}
        <p className="text-white font-bold text-[11px] leading-tight line-clamp-2">{formData.title || '—'}</p>
      </div>
    </div>
  ) : t === 'split' ? (
    <div className="flex-1 flex overflow-hidden">
      {formData.templatePlacement === 'right' ? (
        <>{textBlock}{imgEl('w-2/5 shrink-0')}</>
      ) : (
        <>{imgEl('w-2/5 shrink-0')}{textBlock}</>
      )}
    </div>
  ) : t === 'featured' ? (
    <div className="flex-1 flex flex-col p-2.5 justify-center gap-1" style={{ borderTop: `2px solid ${cfg.accent}` }}>
      {badges}
      <p className="text-white font-black text-[12px] leading-tight line-clamp-2">{formData.title || <span className="opacity-40">Title…</span>}</p>
      <p className="text-slate-300 text-[9px] leading-relaxed line-clamp-3">{formData.description || ''}</p>
      {hasImage && <div className="mt-1 h-10 rounded overflow-hidden">{imgEl('w-full h-full')}</div>}
    </div>
  ) : (
    // standard
    <div className="flex-1 flex overflow-hidden">
      {textBlock}
      {hasImage && imgEl('w-2/5 shrink-0')}
    </div>
  );

  const showIssued = formData.showIssuedBy !== false;
  const showValid = formData.showValidTill !== false;

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] rounded-lg overflow-hidden text-white">
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border-b border-white/5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="w-2 h-2 rounded-full bg-yellow-500" />
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-[8px] text-slate-500 font-mono ml-1">TV Preview</span>
      </div>
      {body}
      {(showIssued || showValid) && (
        <div className="shrink-0 flex items-center justify-between px-2.5 py-1.5 bg-slate-900/60 border-t border-white/5">
          {showIssued && (
            <div className="flex items-center gap-1 text-slate-400 text-[8px]">
              <User className="h-2 w-2" />{facultyName}
            </div>
          )}
          {showValid && (
            <div className="flex items-center gap-1 text-slate-400 text-[8px] ml-auto">
              <Clock className="h-2 w-2" />Till {format(formData.endTime, 'dd MMM yyyy')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-2 mb-3">
    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-foreground leading-none">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AddEditNoticeModal: React.FC<AddEditNoticeModalProps> = ({ isOpen, onClose, onSubmit, editingNotice }) => {
  const { faculty } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [descriptionTab, setDescriptionTab] = useState<'text' | 'extract'>('text');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
  const [showIssuedBy, setShowIssuedBy] = useState(true);
  const [showValidTill, setShowValidTill] = useState(true);

  useEffect(() => {
    if (editingNotice) {
      setFormData({
        title: editingNotice.title,
        description: editingNotice.description,
        category: editingNotice.category,
        customCategory: editingNotice.customCategory || '',
        priority: editingNotice.priority,
        template: editingNotice.template,
        templatePlacement: editingNotice.templatePlacement || 'left',
        imageUrl: editingNotice.imageUrl || '',
        documentUrl: editingNotice.documentUrl || '',
        startTime: new Date(editingNotice.startTime),
        endTime: new Date(editingNotice.endTime),
      });
      setShowIssuedBy(editingNotice.showIssuedBy !== false);
      setShowValidTill(editingNotice.showValidTill !== false);
      setUploadedImage('');
    } else {
      setFormData(defaultFormData);
      setShowIssuedBy(true);
      setShowValidTill(true);
      setUploadedImage('');
      setExtractedLinks([]);
      setDescriptionTab('text');
    }
  }, [editingNotice, isOpen]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (!formData.description.trim()) { toast.error('Description is required'); return; }
    if (formData.category === 'other' && !formData.customCategory?.trim()) {
      toast.error('Please enter a custom category name'); return;
    }
    if (!isAchievement && formData.endTime <= formData.startTime) {
      toast.error('End time must be after start time'); return;
    }
    onSubmit({
      ...formData,
      showIssuedBy,
      showValidTill,
      facultyName: faculty?.name || 'Unknown Faculty',
      ...(isAchievement && {
        priority: 'low' as const,
        startTime: new Date(),
        endTime: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
      }),
    });
    onClose();
  };

  const handleExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      setIsExtracting(true);
      try {
        const type = file.type === 'application/pdf' ? 'pdf' : 'image';
        const { title, description, links } = await extractTextFromFile(base64, type);
        set('description', description);
        if (title && !formData.title) set('title', title);
        if (links.length > 0) set('registrationUrl', links[0]);
        setExtractedLinks(links);
        setDescriptionTab('text');
        toast.success('Extracted! Title and description filled in. Review before saving.');
      } catch {
        toast.error('Failed to extract text. Please type manually.');
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set('imageUrl', reader.result as string);
    reader.readAsDataURL(file);
  };

  const setEndTimePreset = (preset: string) => {
    const base = new Date();
    const map: Record<string, Date> = {
      today: new Date(new Date().setHours(23, 59, 0, 0)),
      '1d': addDays(base, 1),
      '3d': addDays(base, 3),
      '1w': addWeeks(base, 1),
      '2w': addWeeks(base, 2),
      '1m': addMonths(base, 1),
    };
    if (map[preset]) set('endTime', map[preset]);
  };

  const selectedTemplate = TEMPLATES.find(t => t.value === formData.template);
  const isAchievement = formData.category === 'achievements';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[96vw] max-h-[95vh] p-0 gap-0 overflow-hidden bg-background">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-card shrink-0">
          <DialogTitle className="text-lg font-bold">
            {editingNotice ? 'Edit Notice' : 'Create New Notice'}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {editingNotice
              ? 'Update notice details. Changes reflect on the TV immediately.'
              : 'Fill in the details. Preview how it looks on the TV board in real-time.'}
          </p>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left: Form */}
          <form
            id="notice-form"
            onSubmit={handleSubmit}
            className="flex-1 min-w-0 overflow-y-auto px-6 py-5 space-y-6"
          >
            {/* 1. Title */}
            <div className="space-y-2">
              <SectionHeader
                icon={<FileText className="h-3.5 w-3.5" />}
                title="Title"
                subtitle="Keep it short and clear — this is the first thing students read"
              />
              <div className="relative">
                <Input
                  placeholder="e.g. Final Exam Schedule — May 2026"
                  value={formData.title}
                  maxLength={120}
                  onChange={e => set('title', e.target.value)}
                  className={cn('pr-16', formData.title.length > 90 && 'border-amber-500 focus-visible:ring-amber-500')}
                  autoFocus
                  required
                />
                <span className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums pointer-events-none',
                  formData.title.length > 90 ? 'text-amber-500' : 'text-muted-foreground'
                )}>
                  {formData.title.length}/120
                </span>
              </div>
              {formData.title.length > 90 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Long titles may be cut off on smaller screens.
                </p>
              )}
            </div>

            <Separator />

            {/* 2. Description */}
            <div className="space-y-2">
              <SectionHeader
                icon={<AlignLeft className="h-3.5 w-3.5" />}
                title="Description"
                subtitle="The main body text — type it or extract from an image"
              />
              <Tabs value={descriptionTab} onValueChange={v => setDescriptionTab(v as 'text' | 'extract')}>
                <TabsList className="h-8 mb-2">
                  <TabsTrigger value="text" className="gap-1.5 text-xs px-3">
                    <AlignLeft className="h-3 w-3" /> Type text
                  </TabsTrigger>
                  <TabsTrigger value="extract" className="gap-1.5 text-xs px-3">
                    <Upload className="h-3 w-3" /> Extract from file
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-0">
                  <Textarea
                    placeholder="Enter the notice content here…"
                    rows={5}
                    value={formData.description}
                    onChange={e => set('description', e.target.value)}
                    required
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{formData.description.length} chars</p>
                </TabsContent>

                <TabsContent value="extract" className="mt-0 space-y-3">
                  <div
                    className="border-2 border-dashed rounded-lg p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isExtracting ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        <p className="text-sm font-medium">Extracting key points…</p>
                        <p className="text-xs text-muted-foreground">AI is summarising your document</p>
                      </div>
                    ) : uploadedImage ? (
                      <div className="space-y-2">
                        <img src={uploadedImage} alt="Uploaded" className="max-h-28 mx-auto rounded-lg object-contain" />
                        <p className="text-xs text-muted-foreground">Click to replace</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">Upload an image (JPG / PNG)</p>
                        <p className="text-xs text-muted-foreground">AI will extract and summarise the key points</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleExtract} />
                  </div>
                  {formData.description && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Extracted text (editable)</Label>
                      <Textarea rows={4} value={formData.description} onChange={e => set('description', e.target.value)} className="resize-none" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* QR code(s) from AI-extracted links */}
            {extractedLinks.length > 0 && (
              <div className="space-y-3">
                {extractedLinks.map((link, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {extractedLinks.length > 1 ? `Link ${i + 1} — Scan QR to open` : 'Scan QR to Register / Open Link'}
                    </p>
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <QRCodeSVG value={link} size={148} includeMargin={false} />
                    </div>
                    <p className="text-xs text-muted-foreground break-all text-center max-w-xs">{link}</p>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* 3. Category */}
            <div className="space-y-2">
              <SectionHeader
                icon={<Sparkles className="h-3.5 w-3.5" />}
                title="Category"
                subtitle="Helps students filter and identify the type of notice"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.entries(categoryConfig) as [string, typeof categoryConfig[string]][]).map(([cat, cfg]) => {
                  const Icon = cfg.icon;
                  const isActive = formData.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => set('category', cat as Category)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left',
                        isActive
                          ? 'border-2'
                          : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                      style={isActive ? { borderColor: cfg.accent, backgroundColor: `${cfg.accent}20`, color: cfg.accent } : {}}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
              {formData.category === 'other' && (
                <Input
                  placeholder="Enter custom category (e.g. Workshop, Sports, Club)"
                  value={formData.customCategory || ''}
                  onChange={e => set('customCategory', e.target.value)}
                  className="mt-2 border-dashed"
                />
              )}
            </div>

            {!isAchievement && (
              <>
                <Separator />
                {/* 4. Priority */}
                <div className="space-y-2">
                  <SectionHeader
                    icon={<Zap className="h-3.5 w-3.5" />}
                    title="Priority"
                    subtitle="Determines how prominently the notice is displayed on the TV"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => set('priority', p.value)}
                        className={cn(
                          'flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left',
                          formData.priority === p.value
                            ? `${p.bg} ${p.color}`
                            : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted'
                        )}
                      >
                        <div className={cn('flex items-center gap-1.5 font-semibold text-sm', formData.priority === p.value ? p.color : '')}>
                          {p.icon} {p.label}
                        </div>
                        <span className="text-[11px] leading-tight opacity-80">{p.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* 5. Template */}
            <div className="space-y-2">
              <SectionHeader
                icon={<GalleryHorizontal className="h-3.5 w-3.5" />}
                title="Display Style"
                subtitle="How the notice is laid out on the TV screen"
              />
              <div className="grid grid-cols-5 gap-2">
                {TEMPLATES.map(t => {
                  const isActive = formData.template === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('template', t.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all',
                        isActive
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <div className={cn(
                        'w-full h-12 rounded overflow-hidden text-current border',
                        isActive ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/50'
                      )}>
                        {t.preview}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-medium">
                        {t.icon}<span>{t.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedTemplate?.hasPlacement && (
                <div className="flex items-center gap-3 mt-2 p-3 rounded-lg bg-muted/40 border">
                  <span className="text-xs text-muted-foreground flex-1">Image position on TV</span>
                  <div className="flex gap-1">
                    {(['left', 'right'] as TemplatePlacement[]).map(pos => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => set('templatePlacement', pos)}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
                          formData.templatePlacement === pos
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:bg-muted'
                        )}
                      >
                        {pos === 'left' ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        Image {pos === 'left' ? 'left' : 'right'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* 6. TV Display Options */}
            <div className="space-y-2">
              <SectionHeader
                icon={<Tv className="h-3.5 w-3.5" />}
                title="TV Display Options"
                subtitle="Control what additional info students see on the TV board"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border">
                  <div>
                    <p className="text-sm font-medium">Show &quot;Issued By&quot;</p>
                    <p className="text-xs text-muted-foreground">Display your name at the bottom</p>
                  </div>
                  <Switch checked={showIssuedBy} onCheckedChange={setShowIssuedBy} />
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border">
                  <div>
                    <p className="text-sm font-medium">Show &quot;Valid Till&quot; date</p>
                    <p className="text-xs text-muted-foreground">Display the expiry date on screen</p>
                  </div>
                  <Switch checked={showValidTill} onCheckedChange={setShowValidTill} />
                </div>
              </div>
            </div>

            {!isAchievement && (
              <>
                <Separator />
                {/* 7. Schedule */}
                <div className="space-y-2">
              <SectionHeader
                icon={<Clock className="h-3.5 w-3.5" />}
                title="Schedule"
                subtitle="When this notice appears and disappears from the TV board"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Start showing</Label>
                  <Input
                    type="datetime-local"
                    value={fmtDTL(formData.startTime)}
                    onChange={e => set('startTime', new Date(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Stop showing (expires)</Label>
                  <Input
                    type="datetime-local"
                    value={fmtDTL(formData.endTime)}
                    onChange={e => set('endTime', new Date(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-muted-foreground mr-1">Quick expire:</span>
                {[
                  { key: 'today', label: 'End of today' },
                  { key: '1d', label: '+1 day' },
                  { key: '3d', label: '+3 days' },
                  { key: '1w', label: '+1 week' },
                  { key: '2w', label: '+2 weeks' },
                  { key: '1m', label: '+1 month' },
                ].map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setEndTimePreset(p.key)}
                    className="px-2.5 py-1 text-xs rounded-full border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {formData.endTime <= formData.startTime && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> End time must be after start time.
                </p>
              )}
            </div>
              </>
            )}

            <Separator />

            {/* 8. Media */}
            <div className="space-y-3">
              <SectionHeader
                icon={<Image className="h-3.5 w-3.5" />}
                title="Media"
                subtitle="Attach an image or document to display alongside the notice"
              />

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Notice image</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL…"
                    value={typeof formData.imageUrl === 'string' && formData.imageUrl.startsWith('http') ? formData.imageUrl : ''}
                    onChange={e => set('imageUrl', e.target.value)}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('nImg')?.click()} title="Upload image">
                    <Upload className="h-4 w-4" />
                  </Button>
                  {formData.imageUrl && (
                    <Button type="button" variant="outline" size="icon" onClick={() => set('imageUrl', '')} title="Remove">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <input id="nImg" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>

                {formData.imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border h-36">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={() => set('imageUrl', '')} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20" />
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center gap-1 text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => document.getElementById('nImg')?.click()}
                  >
                    <ImagePlus className="h-5 w-5" />
                    <p className="text-xs">Click to upload an image</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Document / PDF URL <span className="opacity-60">(optional)</span></Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Google Drive or direct PDF link…"
                    value={formData.documentUrl || ''}
                    onChange={e => set('documentUrl', e.target.value)}
                  />
                  {formData.documentUrl && (
                    <Button type="button" variant="outline" size="icon" onClick={() => set('documentUrl', '')}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Google Drive links supported — first page shown as image on TV</p>
              </div>
            </div>

            <div className="h-4" />
          </form>

          {/* Right: Live Preview */}
          <div className="hidden lg:flex w-80 shrink-0 flex-col border-l bg-muted/20">
            <div className="px-4 py-3 border-b bg-card shrink-0">
              <div className="flex items-center gap-2">
                <Tv className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Live TV Preview</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Updates as you type</p>
            </div>
            <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
              <div className="w-full" style={{ aspectRatio: '16/9' }}>
                <MiniPreview
                  formData={{ ...formData, showIssuedBy, showValidTill }}
                  facultyName={faculty?.name || 'Faculty Name'}
                />
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const cfg = categoryConfig[formData.category] || categoryConfig.other;
                    return (
                      <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-semibold" style={{ backgroundColor: cfg.accent }}>
                        {formData.customCategory || cfg.label}
                      </span>
                    );
                  })()}
                  {!isAchievement && <span className="px-2 py-0.5 rounded-full bg-muted border text-[10px] capitalize">{formData.priority} priority</span>}
                  {!isAchievement && <span className="px-2 py-0.5 rounded-full bg-muted border text-[10px] capitalize">{formData.template}</span>}
                  {isAchievement && <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold">Always Displayed</span>}
                </div>
                <div className="text-[11px] leading-relaxed space-y-1">
                  {!isAchievement && <p>⏰ Active <strong>{format(formData.startTime, 'dd MMM, HH:mm')}</strong></p>}
                  {!isAchievement && <p>⌛ Expires <strong>{format(formData.endTime, 'dd MMM yyyy, HH:mm')}</strong></p>}
                  {isAchievement && <p>🏆 Shown in <strong>Student Spotlight</strong> sidebar</p>}
                  {faculty?.name && <p>👤 Issued by <strong>{faculty.name}</strong></p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t bg-card">
          <p className="text-xs text-muted-foreground hidden sm:block">
            {editingNotice ? 'Changes are saved immediately on submit.' : 'Notice goes live at the scheduled start time.'}
          </p>
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="notice-form">
              {editingNotice
                ? (isAchievement ? 'Update Achievement' : 'Save Changes')
                : (isAchievement ? 'Publish Achievement' : 'Publish Notice')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditNoticeModal;
