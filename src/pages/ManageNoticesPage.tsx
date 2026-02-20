import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  AlertTriangle,
  ArrowUpDown
} from "lucide-react";
import { format } from "date-fns";
import { useNotices } from "@/hooks/useFirebaseNotices";
import { Category } from "@/integrations/firebase/types";
import { cn } from "@/lib/utils";

const ManageNoticesPage: React.FC = () => {
  const navigate = useNavigate();
  const { notices, removeNotice } = useNotices();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || notice.category === categoryFilter;
    const isNotArchived = !notice.isArchived;
    return matchesSearch && matchesCategory && isNotArchived;
  });

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      academic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      examinations: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      placements: "bg-primary/10 text-primary border-primary/20",
      events: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      announcements: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      other: "bg-muted text-muted-foreground",
    };
    const style = styles[category] || styles.other;
    return (
      <Badge variant="outline" className={cn("capitalize", style)}>
        {category}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: "bg-destructive/10 text-destructive border-destructive/20",
      medium: "bg-primary/10 text-primary border-primary/20",
      low: "bg-secondary/80 text-secondary-foreground",
    };
    return (
      <Badge variant="outline" className={cn("capitalize", styles[priority])}>
        {priority === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
        {priority}
      </Badge>
    );
  };

  const handleDelete = (id: string) => {
    removeNotice(id, false); // soft delete (archive)
  };

  return (
    <AdminLayout
      title="Manage Notices"
      subtitle="View, edit, and delete existing notices"
    >
      <div className="container py-6 px-4 md:px-6">
        {/* Action Bar */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(value: Category | "all") => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
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
          </div>

          <Button onClick={() => navigate("/add-notice")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Notice
          </Button>
        </div>

        {/* Notices Table */}
        <Card>
          <CardHeader className="border-b bg-muted/30 py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              All Notices
              <Badge variant="secondary" className="ml-2">
                {filteredNotices.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="w-[300px]">
                    <div className="flex items-center gap-1">
                      Title
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileText className="h-8 w-8" />
                        <p>No notices found</p>
                        <Button
                          variant="link"
                          onClick={() => navigate("/add-notice")}
                          className="text-primary"
                        >
                          Create your first notice
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotices.map((notice) => (
                    <TableRow key={notice.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="max-w-[280px]">
                          <p className="truncate">{notice.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {notice.description.substring(0, 50)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(notice.category)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(notice.startTime), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(notice.endTime), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{getPriorityBadge(notice.priority)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/add-notice?edit=${notice.id}`)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-background">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{notice.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(notice.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ManageNoticesPage;
