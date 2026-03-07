import React, { useState, useEffect, useRef } from "react";
import { uploadNoticeFile } from "@/integrations/firebase/storageService";
import { extractTextFromFile } from "@/lib/extractText";
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/notice/MarkdownEditor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Upload, X, FileText, Loader2, Zap, Tv, Clock, Sparkles, Trophy, GalleryHorizontal, Image, AlignLeft, AlertTriangle, Minus, Monitor, Smartphone } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNotices } from "@/hooks/useFirebaseNotices";
import { CreateNoticeInput } from "@/integrations/firebase/noticesService";
import { Category, Priority, Template, TemplatePlacement } from "@/integrations/firebase/types";
import { TVNoticePreview } from "@/components/TVNoticePreview";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { categoryConfig } from "@/config/categoryConfig";
import { addDays, addWeeks, addMonths } from "date-fns";

const PRIORITIES: { value: Priority; label: string; sub: string; color: string; bg: string; icon: React.ReactNode }[] = [
  { value: 'high', label: 'Urgent', sub: 'Alert style, shown on top', color: 'text-rose-600 border-rose-500', bg: 'bg-rose-500/10', icon: <Zap className="h-4 w-4" /> },
  { value: 'medium', label: 'Important', sub: 'Standard mid-priority', color: 'text-amber-600 border-amber-500', bg: 'bg-amber-500/10', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'low', label: 'General', sub: 'Informational notice', color: 'text-sky-600 border-sky-500', bg: 'bg-sky-500/10', icon: <Minus className="h-4 w-4" /> },
];

const TEMPLATES: { value: Template; label: string; description: string; icon: React.ReactNode; hasPlacement: boolean; preview: React.ReactNode }[] = [
  {
    value: 'standard', label: 'Standard', description: 'Balanced layout with image and text',
    icon: <FileText className="h-4 w-4" />, hasPlacement: false,
    preview: (<div className="flex flex-col gap-1 p-2 h-full"><div className="h-2 bg-current rounded w-3/4 opacity-60" /><div className="h-1.5 bg-current rounded w-full opacity-30 mt-1" /><div className="h-1.5 bg-current rounded w-5/6 opacity-30" /><div className="h-1.5 bg-current rounded w-4/6 opacity-30" /></div>),
  },
  {
    value: 'split', label: 'Split Screen', description: 'Image on one side, text on the other',
    icon: <GalleryHorizontal className="h-4 w-4" />, hasPlacement: true,
    preview: (<div className="flex gap-1 p-2 h-full"><div className="w-1/2 bg-current rounded opacity-20" /><div className="flex-1 flex flex-col gap-1 justify-center"><div className="h-2 bg-current rounded opacity-60" /><div className="h-1.5 bg-current rounded opacity-30" /><div className="h-1.5 bg-current rounded w-3/4 opacity-30" /></div></div>),
  },
  {
    value: 'full-image', label: 'Full Image', description: 'Image background with text overlay',
    icon: <Image className="h-4 w-4" />, hasPlacement: false,
    preview: (<div className="relative p-2 h-full flex items-end"><div className="absolute inset-0 bg-current opacity-20 rounded" /><div className="relative flex flex-col gap-1 w-full"><div className="h-2 bg-current rounded w-3/4 opacity-80" /><div className="h-1.5 bg-current rounded opacity-50" /></div></div>),
  },
  {
    value: 'text-only', label: 'Text Only', description: 'Large, readable text without images',
    icon: <AlignLeft className="h-4 w-4" />, hasPlacement: false,
    preview: (<div className="flex flex-col gap-1.5 p-2 h-full justify-center"><div className="h-2.5 bg-current rounded w-2/3 opacity-70 mx-auto" /><div className="h-1.5 bg-current rounded opacity-30 mx-auto w-5/6" /><div className="h-1.5 bg-current rounded opacity-30 mx-auto w-4/6" /></div>),
  },
  {
    value: 'featured', label: 'Featured', description: 'Special styling for major highlights',
    icon: <Sparkles className="h-4 w-4" />, hasPlacement: false,
    preview: (<div className="flex flex-col gap-1 p-2 h-full"><div className="h-0.5 bg-current opacity-60 rounded mb-1" /><div className="h-3 bg-current rounded w-3/4 opacity-80" /><div className="h-1.5 bg-current rounded w-full opacity-30 mt-1" /><div className="h-1.5 bg-current rounded w-5/6 opacity-30" /><div className="h-0.5 bg-current opacity-60 rounded mt-1" /></div>),
  },
];

const toTimeInputValue = (date: Date) => format(date, "HH:mm");

const applyTimeToDate = (baseDate: Date, timeValue: string) => {
  const [hours, minutes] = timeValue.split(':').map(Number);
  const next = new Date(baseDate);
  next.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return next;
};

const getUtcOffsetLabel = () => {
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
};


const AddEditNoticePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { notices, addNotice, editNotice } = useNotices();
  const { toast } = useToast();

  const { faculty } = useAuth();

  const previewContainerRef = React.useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = React.useState(0.25);

  React.useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const scaleW = width / 1792;
      const scaleH = height / 800;
      setPreviewScale(Math.min(scaleW, scaleH));
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const [formData, setFormData] = useState<CreateNoticeInput>({
    title: "",
    description: "",
    category: "academic",
    priority: "medium",
    template: "standard",
    templatePlacement: "left",
    facultyName: faculty?.name || "Faculty",
    facultyId: faculty?.id || "unknown",
    startTime: new Date(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isArchived: false,
    showIssuedBy: true,
    showValidTill: true,
    showTextOverlay: true,
    registrationUrl: "",
  });
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
  const utcOffsetLabel = getUtcOffsetLabel();

  // update name if context changes
  useEffect(() => {
    if (faculty && !editId) {
      setFormData(prev => ({
        ...prev,
        facultyName: faculty.name,
        facultyId: faculty.id
      }));
    }
  }, [faculty, editId]);

  // isHighPriority is kept for backward compat with submit logic but priority card drives it too
  const [isHighPriority, setIsHighPriority] = useState(false);
  const isAchievement = formData.category === 'achievements';

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Detect whether the current upload / existing file is a PDF
  const hasPdf = React.useMemo(() => {
    if (uploadedFile) {
      return uploadedFile.type === 'application/pdf' || uploadedFile.name.toLowerCase().endsWith('.pdf');
    }
    if (formData.pdfOrientation) {
      return true;
    }
    if (editId && formData.imageUrl) {
      const url = formData.imageUrl.toLowerCase();
      return url.includes('.pdf') || url.includes('export=download');
    }
    return false;
  }, [uploadedFile, formData.imageUrl, formData.pdfOrientation, editId]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [descTab, setDescTab] = useState<'type' | 'extract'>('type');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractPreview, setExtractPreview] = useState<string>('');
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
  const extractInputRef = useRef<HTMLInputElement>(null);

  const handleExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setExtractPreview(base64);
      setIsExtracting(true);
      try {
        const type = file.type === 'application/pdf' ? 'pdf' : 'image';
        const { title, description, links } = await extractTextFromFile(base64, type);
        setFormData(prev => ({
          ...prev,
          description,
          ...(title && !prev.title ? { title } : {}),
          ...(links.length > 0 ? { registrationUrl: links[0] } : {}),
        }));
        setExtractedLinks(links);
        setDescTab('type');
        toast({ title: 'Extracted!', description: 'Title and description filled in. Review before saving.' });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to extract text.';
        toast({ title: 'Extraction failed', description: msg, variant: 'destructive' });
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (editId) {
      const notice = notices.find((n) => n.id === editId);
      if (notice) {
        setFormData({
          title: notice.title,
          description: notice.description,
          category: notice.category,
          priority: notice.priority,
          template: notice.template,
          templatePlacement: notice.templatePlacement || "left",
          facultyName: notice.facultyName,
          facultyId: notice.facultyId,
          startTime: new Date(notice.startTime),
          endTime: new Date(notice.endTime),
          imageUrl: notice.imageUrl,
          customCategory: notice.customCategory,
          isArchived: notice.isArchived,
          showIssuedBy: notice.showIssuedBy !== false,
          showValidTill: notice.showValidTill !== false,
          showTextOverlay: notice.showTextOverlay !== false,
        });
        setIsHighPriority(notice.priority === "high");
        setFormData(prev => ({ ...prev, priority: notice.priority, pdfOrientation: notice.pdfOrientation }));
      }
    }
  }, [editId, notices]);

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
    if (map[preset]) setFormData(prev => ({ ...prev, endTime: map[preset] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For PDF notices, title/description are optional.
    // For all other notices, keep them mandatory.
    if (!hasPdf && !formData.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a notice title.",
        variant: "destructive",
      });
      return;
    }
    if (!hasPdf && !formData.description.trim()) {
      toast({
        title: "Missing description",
        description: "Please enter a notice description.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const selectedStartTime = new Date(formData.startTime);
    const computedEndTime = new Date(formData.endTime);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedStartDateOnly = new Date(
      selectedStartTime.getFullYear(),
      selectedStartTime.getMonth(),
      selectedStartTime.getDate()
    );
    const isPublishNow = selectedStartDateOnly.getTime() === startOfToday.getTime();
    const isScheduled = selectedStartDateOnly.getTime() > startOfToday.getTime();
    const isPastDate = selectedStartDateOnly.getTime() < startOfToday.getTime();
    const computedStartTime = isPublishNow ? now : selectedStartTime;

    if (!isAchievement) {
      if (isPastDate) {
        toast({
          title: "Invalid start date",
          description: "Start date cannot be in the past.",
          variant: "destructive",
        });
        return;
      }
      if (isScheduled && computedStartTime.getTime() <= now.getTime()) {
        toast({
          title: "Invalid schedule",
          description: "Scheduled notices must have a future start time.",
          variant: "destructive",
        });
        return;
      }
      if (computedEndTime.getTime() <= computedStartTime.getTime()) {
        toast({
          title: "Invalid schedule window",
          description: "End time must be after start time.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;
      const pdfFallbackTime = format(new Date(), "dd MMM yyyy, hh:mm a");
      const normalizedTitle = hasPdf
        ? (formData.title.trim() || `PDF Notice (${pdfFallbackTime})`)
        : formData.title.trim();
      const normalizedDescription = hasPdf
        ? (formData.description.trim() || "PDF document notice uploaded. Open the attached document for full details.")
        : formData.description.trim();

      // check for new file upload
      if (uploadedFile) {
        toast({
          title: 'Uploading file',
          description: 'Please wait while we save your file...',
        });
        setUploadProgress(0);
        finalImageUrl = await uploadNoticeFile(uploadedFile, setUploadProgress, {
          category: formData.category,
          facultyId: formData.facultyId,
          facultyName: formData.facultyName,
          noticeTitle: normalizedTitle,
          startTime: computedStartTime,
          endTime: computedEndTime,
        });
      }

      const dataToSubmit: CreateNoticeInput = {
        ...formData,
        title: normalizedTitle,
        description: normalizedDescription,
        imageUrl: finalImageUrl || "",
        priority: isAchievement ? "low" : (isHighPriority ? "high" : formData.priority),
        startTime: computedStartTime,
        endTime: computedEndTime,
        // Achievements have no expiry — set 10 years out so they always display
        ...(isAchievement && {
          startTime: new Date(),
          endTime: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        }),
      };

      let success = false;
      if (editId) {
        success = await editNotice(editId, dataToSubmit);
      } else {
        success = await addNotice(dataToSubmit);
      }

      if (success) {
        navigate("/manage-notices");
      }
    } catch (error) {
      console.error("Submission error:", error);
      const message = error instanceof Error ? error.message : "There was an error uploading your file. Please check your connection.";
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <AdminLayout
      title={editId ? "Edit Notice" : "Add New Notice"}
      subtitle="Create or modify notice details"
    >
      <div className="container max-w-4xl py-8 px-4 md:px-6">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-xl">
              {isAchievement
                ? <Trophy className="h-5 w-5 text-yellow-500" />
                : <FileText className="h-5 w-5 text-primary" />}
              {isAchievement ? 'Achievement Details' : 'Notice Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Achievement info banner */}
              {isAchievement && (
                <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
                  <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-yellow-200/80 leading-relaxed">
                    Achievements are shown in the <span className="font-bold text-yellow-400">Student Spotlight</span> panel on TV displays — not in the main notice rotation. Fill in the title and a short description of the achievement.
                  </p>
                </div>
              )}

              {/* title field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  {isAchievement ? 'Achievement Title' : 'Notice Title'} {!hasPdf && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={hasPdf ? 'Optional for PDF notices' : (isAchievement ? 'e.g. 1st Place at TechFest 2026' : 'Enter notice title')}
                  required={!hasPdf}
                  className="h-11"
                />
              </div>

              {/* details field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {isAchievement ? 'Achievement Description' : 'Description'} {!hasPdf && <span className="text-destructive">*</span>}
                </Label>
                <Tabs value={descTab} onValueChange={v => setDescTab(v as 'type' | 'extract')}>
                  <TabsList className="h-8 mb-2">
                    <TabsTrigger value="type" className="gap-1.5 text-xs px-3">
                      <AlignLeft className="h-3 w-3" /> Type text
                    </TabsTrigger>
                    <TabsTrigger value="extract" className="gap-1.5 text-xs px-3">
                      <Sparkles className="h-3 w-3" /> Extract from file
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="type" className="mt-0">
                    <MarkdownEditor
                      id="description"
                      value={formData.description}
                      onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
                      placeholder={hasPdf ? 'Optional for PDF notices' : (isAchievement ? 'Brief description, e.g. Won 1st place competing against 200+ teams...' : 'Enter detailed description... Use **bold**, - bullet lists, ## headings and more.')}
                      required={!hasPdf}
                      minRows={10}
                    />
                  </TabsContent>

                  <TabsContent value="extract" className="mt-0">
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                      onClick={() => extractInputRef.current?.click()}
                    >
                      {isExtracting ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm font-medium">AI is extracting key points…</p>
                          <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                        </div>
                      ) : extractPreview ? (
                        <div className="space-y-2">
                          {extractPreview.startsWith('data:image') ? (
                            <img src={extractPreview} alt="Uploaded" className="max-h-32 mx-auto rounded-lg object-contain" />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <FileText className="h-10 w-10 text-rose-500" />
                              <p className="text-sm text-muted-foreground">PDF uploaded</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">Click to replace</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium">Upload an image (JPG / PNG)</p>
                          <p className="text-xs text-muted-foreground">AI will extract and summarise the key points into the description</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={extractInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleExtract}
                    />
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
                        <QRCodeSVG value={link} size={160} includeMargin={false} />
                      </div>
                      <p className="text-xs text-muted-foreground break-all text-center max-w-xs">{link}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* file upload block */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Upload File (PDF/Image)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, JPG, PNG up to 10MB
                    </span>
                  </label>
                  {isUploading && uploadedFile && (
                    <div className="mt-3 w-full">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-200 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-1">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Orientation selector — only visible when a PDF is present */}
              {hasPdf && !isAchievement && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Document Shape</Label>
                  <p className="text-xs text-muted-foreground">Controls how this PDF is displayed on TV.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['landscape', 'portrait'] as const).map(orient => (
                      <button
                        key={orient}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, pdfOrientation: orient }))}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                          formData.pdfOrientation === orient
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {orient === 'landscape'
                          ? <Monitor className="h-5 w-5" />
                          : <Smartphone className="h-5 w-5" />}
                        <span className="text-xs font-semibold">
                          {orient === 'landscape' ? 'Landscape — Full Screen' : 'Portrait — Side-by-Side'}
                        </span>
                        <span className="text-[10px] opacity-60 leading-tight text-center">
                          {orient === 'landscape'
                            ? 'PDF fills the entire TV width'
                            : 'Two portrait PDFs shown next to each other'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category pill grid */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.entries(categoryConfig) as [string, typeof categoryConfig[string]][]).map(([cat, cfg]) => {
                    const Icon = cfg.icon;
                    const isActive = formData.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat as Category }))}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left',
                          isActive ? 'border-2' : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
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
                  <input
                    type="text"
                    className="mt-2 w-full border border-dashed rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter custom category (e.g. Workshop, Sports, Club)"
                    value={formData.customCategory || ''}
                    onChange={e => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                  />
                )}
              </div>

              {/* Priority 3-card picker — hidden for achievements */}
              {!isAchievement && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, priority: p.value }));
                          setIsHighPriority(p.value === 'high');
                        }}
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
              )}

              {/* Show/hide footer fields */}
              {!isAchievement && (
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2.5 h-9 px-3 rounded-md border bg-background">
                    <Switch
                      id="show-issued-by"
                      checked={formData.showIssuedBy !== false}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, showIssuedBy: v }))}
                    />
                    <Label htmlFor="show-issued-by" className="text-sm cursor-pointer select-none">
                      Show &ldquo;Issued By&rdquo;
                    </Label>
                  </div>
                  <div className="flex items-center gap-2.5 h-9 px-3 rounded-md border bg-background">
                    <Switch
                      id="show-valid-till"
                      checked={formData.showValidTill !== false}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, showValidTill: v }))}
                    />
                    <Label htmlFor="show-valid-till" className="text-sm cursor-pointer select-none">
                      Show &ldquo;Valid Till&rdquo;
                    </Label>
                  </div>
                </div>
              )}

              {/* Template selection — hidden for achievements */}
              {!isAchievement && (
                <div className="space-y-3 pt-4 border-t">
                  <Label className="font-bold text-base">Display Style</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {TEMPLATES.map(tpl => {
                      const isActive = formData.template === tpl.value;
                      return (
                        <button
                          key={tpl.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, template: tpl.value }))}
                          className={cn(
                            'flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all',
                            isActive ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          <div className={cn(
                            'w-full h-12 rounded overflow-hidden text-current border',
                            isActive ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/50'
                          )}>
                            {tpl.preview}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-medium">{tpl.icon}<span>{tpl.label}</span></div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">{TEMPLATES.find(t => t.value === formData.template)?.description}</p>

                  {/* Placement — only visible for split */}
                  {/* Placement — only visible for split */}
                  {formData.template === 'split' && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
                      <span className="text-xs text-muted-foreground flex-1">Image position on TV</span>
                      <div className="flex gap-1">
                        {(['left', 'right'] as TemplatePlacement[]).map(pos => (
                          <Button
                            key={pos}
                            type="button"
                            size="sm"
                            variant={formData.templatePlacement === pos ? 'default' : 'outline'}
                            onClick={() => setFormData(prev => ({ ...prev, templatePlacement: pos }))}
                            className="h-8 px-3 text-xs capitalize"
                          >
                            Image {pos === 'left' ? '← Left' : 'Right →'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text Overlay Toggle — only visible for full-image */}
                  {formData.template === 'full-image' && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
                      <span className="text-xs text-muted-foreground flex-1">Show title & description overlay on top of image</span>
                      <Switch
                        checked={formData.showTextOverlay !== false}
                        onCheckedChange={(v) => setFormData(prev => ({ ...prev, showTextOverlay: v }))}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TV / Achievement Preview Section */}
              <div className="space-y-4 pt-4">
                {isAchievement ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <Label className="font-bold text-lg">Spotlight Preview</Label>
                      <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full font-bold">Student Spotlight</span>
                    </div>
                    {/* Sidebar card mock — exactly how it appears on the TV */}
                    <div className="flex justify-center">
                      <div
                        className="w-72 rounded-2xl border border-yellow-400/20 p-5 flex flex-col gap-4"
                        style={{ background: 'linear-gradient(160deg, #1a1200 0%, #0f0800 100%)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                          <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-500">Student Spotlight</p>
                        </div>
                        {/* 1. Title */}
                        <p className="text-xl font-black text-white leading-snug">
                          {formData.title || <span className="opacity-30 italic">Achievement title…</span>}
                        </p>
                        {/* 2. Image */}
                        {(uploadedFile ? URL.createObjectURL(uploadedFile) : formData.imageUrl) && (
                          <div className="w-full rounded-xl overflow-hidden border border-yellow-400/10" style={{ aspectRatio: '4/3' }}>
                            <img
                              src={uploadedFile ? URL.createObjectURL(uploadedFile) : formData.imageUrl}
                              alt={formData.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {/* 3. Description — strip markdown */}
                        {formData.description && (
                          <p className="text-[0.82rem] text-yellow-100/60 leading-relaxed line-clamp-6">
                            {formData.description
                              .replace(/#{1,6}\s*/g, '')
                              .replace(/\*\*(.+?)\*\*/g, '$1')
                              .replace(/\*(.+?)\*/g, '$1')
                              .replace(/^\s*[-•]\s*/gm, '• ')
                              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                              .trim()
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center italic uppercase tracking-widest">
                      * Shown in the Student Spotlight sidebar on campus TV displays
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Tv className="h-5 w-5 text-primary" />
                      <Label className="font-bold text-lg">TV Preview</Label>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">1080p View</span>
                    </div>
                    <div
                      ref={previewContainerRef}
                      className="relative aspect-video w-full bg-[#05060a] rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl group"
                    >
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-[1792px] h-[800px] shrink-0 origin-center transition-transform duration-200"
                          style={{ transform: `scale(${previewScale * 0.95})` }}
                        >
                          <TVNoticePreview
                            notice={{
                              ...formData,
                              priority: isHighPriority ? "high" : formData.priority,
                              imageUrl: uploadedFile ? URL.createObjectURL(uploadedFile) : formData.imageUrl
                            }}
                          />
                        </div>
                      </div>
                      {(formData.template === 'split' || formData.template === 'full-image') && !formData.imageUrl && !uploadedFile && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <p className="text-slate-400 text-sm font-medium">Please upload an image to preview this template</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center italic uppercase tracking-widest">
                      * This is how the notice will look on the campus TV displays
                    </p>
                  </>
                )}
              </div>


              {/* date pickers — hidden for achievements (always shown) */}
              {!isAchievement && (
                <>
                  <div className="space-y-2 pt-4 border-t">
                    <Label className="font-bold text-base">Schedule</Label>
                    <p className="text-xs text-muted-foreground">
                      If Start Date is today, notice publishes immediately. If Start Date is in the future, notice is scheduled.
                    </p>
                    <div className="text-[11px] text-muted-foreground bg-muted/40 border rounded-md px-3 py-2">
                      Timezone: <span className="font-semibold text-foreground">{localTimeZone}</span> ({utcOffsetLabel})
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* date to start displaying */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-11 justify-start text-left font-normal",
                              !formData.startTime && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startTime
                              ? format(formData.startTime, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-popover" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.startTime}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            onSelect={(date) => {
                              if (date) {
                                const next = new Date(date);
                                next.setHours(formData.startTime.getHours(), formData.startTime.getMinutes(), 0, 0);
                                setFormData((prev) => ({ ...prev, startTime: next }));
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Start Time ({localTimeZone})</Label>
                        <Input
                          type="time"
                          value={toTimeInputValue(formData.startTime)}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({ ...prev, startTime: applyTimeToDate(prev.startTime, value) }));
                          }}
                          className="h-10"
                        />
                      </div>
                    </div>

                    {/* date to stop displaying */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Expiry Date <span className="text-destructive">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-11 justify-start text-left font-normal",
                              !formData.endTime && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endTime
                              ? format(formData.endTime, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-popover" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.endTime}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            onSelect={(date) => {
                              if (date) {
                                const next = new Date(date);
                                next.setHours(formData.endTime.getHours(), formData.endTime.getMinutes(), 0, 0);
                                setFormData((prev) => ({ ...prev, endTime: next }));
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">End Time ({localTimeZone})</Label>
                        <Input
                          type="time"
                          value={toTimeInputValue(formData.endTime)}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({ ...prev, endTime: applyTimeToDate(prev.endTime, value) }));
                          }}
                          className="h-10"
                        />
                      </div>
                      {/* Quick expire presets */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-xs text-muted-foreground mr-1 self-center">Quick:</span>
                        {[
                          { key: 'today', label: 'Today' },
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
                    </div>
                  </div>
                </>
              )}

              {/* save and cancel buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-11 px-8 text-base font-semibold gap-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : editId ? (
                    isAchievement ? 'Update Achievement' : 'Update Notice'
                  ) : (
                    isAchievement ? 'Add Achievement' : 'Create Notice'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddEditNoticePage;

