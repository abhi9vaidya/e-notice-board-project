import React, { useState, useEffect } from "react";
import { uploadToGoogleDrive } from "@/integrations/google/googleDriveService";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Upload, Save, X, FileText, Loader2, Zap, Tv, Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNotices } from "@/hooks/useFirebaseNotices";
import { CreateNoticeInput } from "@/integrations/firebase/noticesService";
import { Category, Priority, Template, TemplatePlacement } from "@/integrations/firebase/types";
import { TVNoticePreview } from "@/components/TVNoticePreview";
import {
  ArrowLeftRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const categories: { value: Category; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "examinations", label: "Examinations" },
  { value: "placements", label: "Placements" },
  { value: "events", label: "Events" },
  { value: "announcements", label: "Announcements" },
  { value: "achievements", label: "Achievements" },
  { value: "other", label: "Other" },
];

const templates: { value: Template; label: string; description: string; icon: React.ElementType }[] = [
  { value: "standard", label: "Standard", description: "Balanced layout with image and text", icon: FileText },
  { value: "split", label: "Split Screen", description: "Large image on one side, text on other", icon: Zap },
  { value: "full-image", label: "Full Image", description: "Image-focused with text overlay", icon: Tv },
  { value: "text-only", label: "Text Only", description: "Large, readable text without images", icon: Clock },
  { value: "featured", label: "Featured", description: "Special styling for major highlights", icon: Sparkles },
];


const AddEditNoticePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { notices, addNotice, editNotice } = useNotices();
  const { toast } = useToast();

  const { faculty } = useAuth();

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
  });

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

  const [isHighPriority, setIsHighPriority] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        });
        setIsHighPriority(notice.priority === "high");
      }
    }
  }, [editId, notices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // check for new file upload
      if (uploadedFile) {
        toast({
          title: "Uploading file",
          description: "Please wait while we save your file to Google Drive...",
        });
        finalImageUrl = await uploadToGoogleDrive(uploadedFile);
      }

      const dataToSubmit: CreateNoticeInput = {
        ...formData,
        imageUrl: finalImageUrl || "",
        priority: isHighPriority ? "high" : formData.priority,
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
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please check your connection.",
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
              <FileText className="h-5 w-5 text-primary" />
              Notice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* title field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Notice Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter notice title"
                  required
                  className="h-11"
                />
              </div>

              {/* details field */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter detailed description..."
                  required
                  rows={5}
                  className="resize-none"
                />
              </div>

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
                      {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, JPG, PNG up to 10MB
                    </span>
                  </label>
                </div>
              </div>

              {/* category and priority */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* dropdown for category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Category) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* high priority switch */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">high Priority</Label>
                  <div className="flex items-center gap-3 h-11 px-3 rounded-md border bg-background">
                    <Switch
                      checked={isHighPriority}
                      onCheckedChange={setIsHighPriority}
                    />
                    <span className={cn(
                      "text-sm",
                      isHighPriority ? "text-destructive font-medium" : "text-muted-foreground"
                    )}>
                      {isHighPriority ? "Urgent Notice" : "Normal Priority"}
                    </span>
                  </div>
                </div>
              </div>

              {/* template selection */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-lg">Display Customization</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Placement</span>
                    <div className="flex bg-muted rounded-lg p-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={formData.templatePlacement === "left" ? "default" : "ghost"}
                        onClick={() => setFormData(prev => ({ ...prev, templatePlacement: "left" }))}
                        className="h-8 px-3 text-xs"
                      >
                        Left
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={formData.templatePlacement === "right" ? "default" : "ghost"}
                        onClick={() => setFormData(prev => ({ ...prev, templatePlacement: "right" }))}
                        className="h-8 px-3 text-xs"
                      >
                        Right
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.value}
                      onClick={() => setFormData(prev => ({ ...prev, template: tpl.value }))}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-primary/50",
                        formData.template === tpl.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <tpl.icon className={cn(
                          "h-5 w-5",
                          formData.template === tpl.value ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="font-semibold text-sm">{tpl.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TV Preview Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Tv className="h-5 w-5 text-primary" />
                  <Label className="font-bold text-lg">TV Preview</Label>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">1080p View</span>
                </div>

                <div className="relative aspect-video w-full bg-[#05060a] rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl group">
                  {/* Scaling the internal preview to fit the container 
                       1792x800 is our internal reference in TVDisplay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="w-[1792px] h-[800px] shrink-0 origin-center scale-[0.25] sm:scale-[0.35] md:scale-[0.45] xl:scale-[0.5]"
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

                  {/* Overlay if image is missing but required */}
                  {(formData.template === 'split' || formData.template === 'full-image') && !formData.imageUrl && !uploadedFile && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <p className="text-slate-400 text-sm font-medium">Please upload an image to preview this template</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground text-center italic uppercase tracking-widest">
                  * This is how the notice will look on the campus TV displays
                </p>
              </div>


              {/* date pickers */}
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
                        onSelect={(date) =>
                          date && setFormData((prev) => ({ ...prev, startTime: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                        onSelect={(date) =>
                          date && setFormData((prev) => ({ ...prev, endTime: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

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
                    "Update Notice"
                  ) : (
                    "Create Notice"
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
