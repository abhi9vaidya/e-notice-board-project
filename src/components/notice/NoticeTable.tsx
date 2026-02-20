import React from 'react';
import { Notice, Category, Priority } from '@/integrations/firebase/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Briefcase,
  BookOpen,
  FolderKanban,
  Sparkles,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NoticeTableProps {
  notices: Notice[];
  isRecent: (notice: Notice) => boolean;
  onEdit: (notice: Notice) => void;
  onDelete: (id: string) => void;
  onView?: (notice: Notice) => void;
}

const categoryConfig: Record<Category, { icon: React.ReactNode; label: string; className: string }> = {
  placement: {
    icon: <Briefcase className="h-4 w-4" />,
    label: 'Placement',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  },
  academic: {
    icon: <BookOpen className="h-4 w-4" />,
    label: 'Academic',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  },
  project: {
    icon: <FolderKanban className="h-4 w-4" />,
    label: 'Project',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  },
  spiritual: {
    icon: <Sparkles className="h-4 w-4" />,
    label: 'Spiritual',
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
  },
  other: {
    icon: <MoreHorizontal className="h-4 w-4" />,
    label: 'Other',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  },
  medium: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  low: {
    label: 'Low',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  },
};

const NoticeTable: React.FC<NoticeTableProps> = ({
  notices,
  isRecent,
  onEdit,
  onDelete,
  onView,
}) => {
  if (notices.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Faculty</TableHead>
            <TableHead className="font-semibold">Valid Until</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notices.map((notice) => {
            const category = categoryConfig[notice.category];
            const priority = priorityConfig[notice.priority];
            const recent = isRecent(notice);

            return (
              <TableRow
                key={notice.id}
                className={cn(
                  'group',
                  recent && 'bg-accent/5',
                  notice.priority === 'high' && 'bg-red-50/50 dark:bg-red-950/10'
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {notice.imageUrl && (
                      <img
                        src={notice.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{notice.title}</span>
                        {recent && (
                          <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {notice.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn('gap-1', category.className)}>
                    {category.icon}
                    {category.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn('gap-1', priority.className)}>
                    {notice.priority === 'high' && <AlertTriangle className="h-3 w-3" />}
                    {priority.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {notice.facultyName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(notice.endTime), 'dd MMM yyyy, hh:mm a')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(notice)} className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(notice)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(notice.id)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default NoticeTable;
