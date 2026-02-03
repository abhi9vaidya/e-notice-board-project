import React, { useState, useEffect, useRef } from 'react';
import { Notice, Category, Priority, Template } from '@/types/notice';
import { NoticeFormData } from '@/hooks/useNotices';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImagePlus, X, Upload, FileText, Loader2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { extractTextFromFile } from '@/lib/extractText';

interface AddEditNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoticeFormData) => void;
  editingNotice?: Notice | null;
}

const defaultFormData: Omit<NoticeFormData, 'facultyName'> = {
  title: '',
  description: '',
  category: 'academic',
  customCategory: '',
  priority: 'medium',
  template: 'standard',
  imageUrl: '',
  startTime: new Date(),
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
};

const AddEditNoticeModal: React.FC<AddEditNoticeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingNotice,
}) => {
  const { faculty } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<NoticeFormData, 'facultyName'>>(defaultFormData);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [descriptionMode, setDescriptionMode] = useState<'text' | 'image'>('text');
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>('');

  useEffect(() => {
    if (editingNotice) {
      setFormData({
        title: editingNotice.title,
        description: editingNotice.description,
        category: editingNotice.category,
        customCategory: editingNotice.customCategory || '',
        priority: editingNotice.priority,
        template: editingNotice.template,
        imageUrl: editingNotice.imageUrl || '',
        startTime: new Date(editingNotice.startTime),
        endTime: new Date(editingNotice.endTime),
      });
      setImagePreview(editingNotice.imageUrl || '');
    } else {
      setFormData(defaultFormData);
      setImagePreview('');
      setUploadedImage('');
    }
  }, [editingNotice, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate custom category if "other" is selected
    if (formData.category === 'other' && !formData.customCategory?.trim()) {
      toast.error('Please enter a custom category name');
      return;
    }
    
    onSubmit({
      ...formData,
      facultyName: faculty?.name || 'Unknown Faculty',
    });
    onClose();
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
  };

  const formatDateTimeLocal = (date: Date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  // Handle image/PDF upload for description extraction using Lovable AI
  const handleImageUploadForOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for display and processing
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      setIsExtracting(true);

      try {
        const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
        const extractedText = await extractTextFromFile(base64, fileType);
        
        setFormData(prev => ({ ...prev, description: extractedText }));
        toast.success('Text extracted successfully! Key points have been summarized.');
      } catch (error) {
        console.error('Extraction error:', error);
        toast.error('Failed to extract text. Please try again or type manually.');
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNoticeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, imageUrl: base64 }));
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingNotice ? 'Edit Notice' : 'Add New Notice'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter notice title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description with Text/Image toggle */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Tabs value={descriptionMode} onValueChange={(v) => setDescriptionMode(v as 'text' | 'image')}>
              <TabsList className="mb-2">
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Type Text
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Extract from Image/PDF
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="mt-0">
                <Textarea
                  id="description"
                  placeholder="Enter notice description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </TabsContent>
              
              <TabsContent value="image" className="mt-0 space-y-3">
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isExtracting ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">AI is extracting key points from your image...</p>
                      <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                    </div>
                  ) : uploadedImage ? (
                    <div className="space-y-3">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground">Click to upload a different image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload an image or PDF to extract key points
                      </p>
                      <p className="text-xs text-muted-foreground">
                        AI will summarize important information automatically
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleImageUploadForOCR}
                  />
                </div>
                
                {formData.description && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Extracted Key Points (editable)</Label>
                    <Textarea
                      placeholder="Extracted text will appear here..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Category) => setFormData(prev => ({ ...prev, category: value, customCategory: value === 'other' ? prev.customCategory : '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="placement">Placement</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                  <SelectItem value="other">Other (Custom)</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Custom Category Input - shown when "other" is selected */}
              {formData.category === 'other' && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter custom category name (e.g., Workshop, Event, Sports)"
                    value={formData.customCategory || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                    className="border-dashed"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="high">High (Urgent)</SelectItem>
                  <SelectItem value="medium">Medium (Important)</SelectItem>
                  <SelectItem value="low">Low (General)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label>Template Style</Label>
            <Select
              value={formData.template}
              onValueChange={(value: Template) => setFormData(prev => ({ ...prev, template: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formatDateTimeLocal(formData.startTime)}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: new Date(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formatDateTimeLocal(formData.endTime)}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: new Date(e.target.value) }))}
                required
              />
            </div>
          </div>

          {/* Notice Image */}
          <div className="space-y-2">
            <Label>Notice Image (optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL or upload"
                value={typeof formData.imageUrl === 'string' && formData.imageUrl.startsWith('http') ? formData.imageUrl : ''}
                onChange={(e) => handleImageUrlChange(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('noticeImageUpload')?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                id="noticeImageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleNoticeImageUpload}
              />
              {formData.imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleImageUrlChange('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview ? (
              <div className="relative mt-2 rounded-lg overflow-hidden border">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-40 object-cover"
                  onError={() => setImagePreview('')}
                />
              </div>
            ) : (
              <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <ImagePlus className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Enter an image URL or upload to preview</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              {editingNotice ? 'Update Notice' : 'Add Notice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditNoticeModal;
