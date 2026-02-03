import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArchive, ArchivedNotice } from '@/hooks/useArchive';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Archive as ArchiveIcon, 
  Search, 
  RotateCcw, 
  Trash2, 
  Calendar,
  Filter,
  BarChart3,
  Clock,
  User,
  Briefcase,
  BookOpen,
  FolderKanban,
  Sparkles,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { Category, Priority } from '@/types/notice';
import { cn } from '@/lib/utils';

const categoryIcons: Record<Category, React.ReactNode> = {
  placement: <Briefcase className="h-3 w-3" />,
  academic: <BookOpen className="h-3 w-3" />,
  project: <FolderKanban className="h-3 w-3" />,
  spiritual: <Sparkles className="h-3 w-3" />,
  other: <MoreHorizontal className="h-3 w-3" />,
};

const priorityColors: Record<Priority, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-primary/10 text-primary border-primary/20',
  low: 'bg-secondary/80 text-secondary-foreground',
};

const ArchivePage: React.FC = () => {
  const navigate = useNavigate();
  const { archivedNotices, restoreNotice, deleteFromArchive, clearArchive, getArchiveStats } = useArchive();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<'archivedAt' | 'createdAt'>('archivedAt');

  const stats = getArchiveStats();

  const filteredNotices = archivedNotices
    .filter(notice => {
      const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || notice.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a[sortBy]).getTime();
      const dateB = new Date(b[sortBy]).getTime();
      return dateB - dateA;
    });

  const handleRestore = (notice: ArchivedNotice) => {
    restoreNotice(notice.id);
  };

  return (
    <AdminLayout title="Archive" subtitle="View and restore expired notices">
      <div className="container py-6 px-4 md:px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Archived</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byCategory.placement || 0}</p>
                  <p className="text-sm text-muted-foreground">Placement</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-secondary/20">
                  <BookOpen className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byCategory.academic || 0}</p>
                  <p className="text-sm text-muted-foreground">Academic</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <FolderKanban className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byCategory.project || 0}</p>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search archived notices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category | 'all')}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="placement">Placement</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="spiritual">Spiritual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'archivedAt' | 'createdAt')}>
                  <SelectTrigger className="w-40">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="archivedAt">Archived Date</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                  </SelectContent>
                </Select>
                {archivedNotices.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear Archive?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all {archivedNotices.length} archived notices. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearArchive} className="bg-destructive text-destructive-foreground">
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Archive List */}
        {filteredNotices.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ArchiveIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Archived Notices</h3>
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'No notices match your search criteria.'
                  : 'Deleted notices will appear here for recovery.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <Card key={notice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Image */}
                    {notice.imageUrl && (
                      <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={notice.imageUrl} 
                          alt={notice.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className={cn(
                          'gap-1',
                          notice.category === 'placement' && 'bg-primary/10 text-primary border-primary/20',
                          notice.category === 'academic' && 'bg-secondary/80 text-secondary-foreground',
                          notice.category === 'project' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                          notice.category === 'spiritual' && 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
                        )}>
                          {categoryIcons[notice.category]}
                          <span className="capitalize">{notice.category}</span>
                        </Badge>
                        <Badge variant="outline" className={priorityColors[notice.priority]}>
                          {notice.priority === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{notice.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{notice.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {notice.facultyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created: {format(new Date(notice.createdAt), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <ArchiveIcon className="h-3 w-3" />
                          Archived: {format(new Date(notice.archivedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestore(notice)}
                        className="flex-1 md:flex-none"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 md:flex-none text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{notice.title}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteFromArchive(notice.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ArchivePage;
