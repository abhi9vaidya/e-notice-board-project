import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  GraduationCap,
  FileCheck,
  Calendar,
  FlaskConical,
  Users,
  Sparkles,
  Trophy,
  ArrowLeft,
  FileText,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { useNotices } from "@/hooks/useFirebaseNotices";
import { cn } from "@/lib/utils";

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  mappedCategory: string;
}

const categoryConfigs: CategoryConfig[] = [
  { id: "placement", label: "Placement", icon: Briefcase, color: "text-primary", bgColor: "bg-primary/10", mappedCategory: "placement" },
  { id: "academic", label: "Academic", icon: GraduationCap, color: "text-secondary", bgColor: "bg-secondary/20", mappedCategory: "academic" },
  { id: "exams", label: "Exams", icon: FileCheck, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/20", mappedCategory: "academic" },
  { id: "timetable", label: "Timetable", icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/20", mappedCategory: "academic" },
  { id: "research", label: "Research", icon: FlaskConical, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/20", mappedCategory: "project" },
  { id: "alumni", label: "Alumni", icon: Users, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/20", mappedCategory: "other" },
  { id: "spiritual", label: "Spiritual", icon: Sparkles, color: "text-violet-600", bgColor: "bg-violet-100 dark:bg-violet-900/20", mappedCategory: "spiritual" },
  { id: "achievements", label: "Achievements", icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/20", mappedCategory: "achievements" },
];


const CategoriesPage: React.FC = () => {
  const { notices } = useNotices();
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const nowMs = Date.now();
  const visibleNotices = notices.filter(
    (n) => !n.isArchived && n.isDraft !== true && n.startTime.getTime() <= nowMs && n.endTime.getTime() >= nowMs
  );

  const getNoticeCount = (config: CategoryConfig) => {
    return visibleNotices.filter((n) => n.category === config.mappedCategory).length;
  };

  const getCategoryNotices = () => {
    if (!selectedCategory) return [];
    return visibleNotices.filter((n) => n.category === selectedCategory.mappedCategory);
  };

  if (selectedCategory) {
    const categoryNotices = getCategoryNotices();
    return (
      <AdminLayout
        title={selectedCategory.label}
        subtitle={`Viewing ${categoryNotices.length} notices`}
      >
        <div className="container py-6 px-4 md:px-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedCategory(null)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>

          <div className="grid gap-4">
            {categoryNotices.length === 0 ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <selectedCategory.icon className={cn("h-12 w-12 mb-4", selectedCategory.color)} />
                  <h3 className="text-lg font-semibold mb-2">No notices found</h3>
                  <p className="text-muted-foreground">
                    There are no notices in the {selectedCategory.label} category.
                  </p>
                </CardContent>
              </Card>
            ) : (
              categoryNotices.map((notice) => (
                <Card key={notice.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <h3 className="font-semibold truncate">{notice.title}</h3>
                          {notice.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {notice.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(notice.startTime), "MMM dd, yyyy")} - {format(new Date(notice.endTime), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Categories"
      subtitle="Browse notices by category"
    >
      <div className="container py-6 px-4 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryConfigs.map((config) => {
            const count = getNoticeCount(config);
            return (
              <Card
                key={config.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                onClick={() => setSelectedCategory(config)}
              >
                <CardHeader className="pb-3">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", config.bgColor)}>
                    <config.icon className={cn("h-6 w-6", config.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-1">{config.label}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {count} {count === 1 ? "notice" : "notices"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CategoriesPage;
