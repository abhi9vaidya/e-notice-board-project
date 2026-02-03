import React, { useState, useEffect } from "react";
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
import { CalendarIcon, Upload, Save, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNotices, NoticeFormData } from "@/hooks/useNotices";
import { Category, Priority } from "@/types/notice";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const categories: { value: Category; label: string }[] = [
  { value: "placement", label: "Placement" },
  { value: "academic", label: "Academic" },
  { value: "project", label: "Project" },
  { value: "spiritual", label: "Spiritual" },
  { value: "other", label: "Other" },
];

const AddEditNoticePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { notices, addNotice, updateNotice } = useNotices();
  const { toast } = useToast();

  const { faculty } = useAuth();

  const [formData, setFormData] = useState<NoticeFormData>({
    title: "",
    description: "",
    category: "academic",
    priority: "medium",
    template: "standard",
    facultyName: faculty?.name || "Admin",
    startTime: new Date(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const [isHighPriority, setIsHighPriority] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
          facultyName: notice.facultyName,
          startTime: new Date(notice.startTime),
          endTime: new Date(notice.endTime),
          imageUrl: notice.imageUrl,
          customCategory: notice.customCategory,
        });
        setIsHighPriority(notice.priority === "high");
      }
    }
  }, [editId, notices]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit: NoticeFormData = {
      ...formData,
      priority: isHighPriority ? "high" : formData.priority,
    };

    if (editId) {
      updateNotice(editId, dataToSubmit);
      toast({
        title: "Notice Updated",
        description: "The notice has been successfully updated.",
      });
    } else {
      addNotice(dataToSubmit);
      toast({
        title: "Notice Created",
        description: "The notice has been successfully created.",
      });
    }

    navigate("/manage-notices");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // In a real app, you'd upload this to storage and get a URL
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
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
              {/* Notice Title */}
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

              {/* Description */}
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

              {/* File Upload */}
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

              {/* Category and Priority Row */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Category */}
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

                {/* Priority Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">High Priority</Label>
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

              {/* Date Row */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Start Date */}
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

                {/* Expiry Date */}
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

              {/* Action Buttons */}
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
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  {editId ? "Update Notice" : "Create Notice"}
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
