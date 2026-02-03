import React from 'react';
import { Notice, Category, Priority } from '@/types/notice';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  Pencil, 
  Trash2, 
  Briefcase, 
  BookOpen, 
  FolderKanban, 
  Sparkles,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NoticeCardProps {
  notice: Notice;
  isRecent: boolean;
  onEdit?: (notice: Notice) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

const categoryConfig: Record<Category, { icon: React.ReactNode; bgClass: string; textClass: string }> = {
  placement: { 
    icon: <Briefcase className="h-3 w-3" />, 
    bgClass: 'bg-placement-bg', 
    textClass: 'text-placement' 
  },
  academic: { 
    icon: <BookOpen className="h-3 w-3" />, 
    bgClass: 'bg-academic-bg', 
    textClass: 'text-academic' 
  },
  project: { 
    icon: <FolderKanban className="h-3 w-3" />, 
    bgClass: 'bg-project-bg', 
    textClass: 'text-project' 
  },
  spiritual: { 
    icon: <Sparkles className="h-3 w-3" />, 
    bgClass: 'bg-spiritual-bg', 
    textClass: 'text-spiritual' 
  },
  other: { 
    icon: <MoreHorizontal className="h-3 w-3" />, 
    bgClass: 'bg-muted', 
    textClass: 'text-muted-foreground' 
  },
};

const priorityConfig: Record<Priority, { label: string; bgClass: string; textClass: string }> = {
  high: { label: 'High Priority', bgClass: 'bg-priority-high-bg', textClass: 'text-priority-high' },
  medium: { label: 'Medium', bgClass: 'bg-priority-medium-bg', textClass: 'text-priority-medium' },
  low: { label: 'Low', bgClass: 'bg-priority-low-bg', textClass: 'text-priority-low' },
};

const NoticeCard: React.FC<NoticeCardProps> = ({ 
  notice, 
  isRecent, 
  onEdit, 
  onDelete, 
  readOnly = false 
}) => {
  const categoryStyle = categoryConfig[notice.category];
  const priorityStyle = priorityConfig[notice.priority];

  return (
    <Card 
      className={cn(
        'card-hover overflow-hidden transition-all duration-300',
        isRecent && 'glow-recent',
        notice.priority === 'high' && 'border-l-4 border-l-priority-high'
      )}
    >
      {/* Image Section */}
      {notice.imageUrl && (
        <div className="relative h-40 w-full overflow-hidden">
          <img 
            src={notice.imageUrl} 
            alt={notice.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {isRecent && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-primary text-primary-foreground animate-pulse">
                New
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className={cn('gap-1', categoryStyle.bgClass, categoryStyle.textClass)}
          >
            {categoryStyle.icon}
            <span className="capitalize">{notice.category}</span>
          </Badge>

          {/* Priority Badge */}
          <Badge 
            variant="secondary" 
            className={cn(
              'gap-1',
              priorityStyle.bgClass, 
              priorityStyle.textClass,
              notice.priority === 'high' && 'priority-high-pulse'
            )}
          >
            {notice.priority === 'high' && <AlertTriangle className="h-3 w-3" />}
            {priorityStyle.label}
          </Badge>
        </div>

        <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-2">
          {notice.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {notice.description}
        </p>

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>{notice.facultyName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {format(new Date(notice.startTime), 'MMM d, h:mm a')} - {format(new Date(notice.endTime), 'MMM d, h:mm a')}
            </span>
          </div>
        </div>
      </CardContent>

      {!readOnly && (
        <CardFooter className="border-t pt-3 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5"
            onClick={() => onEdit?.(notice)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete?.(notice.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NoticeCard;
