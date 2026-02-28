import React, { useState } from 'react';
import { Notice, Category } from '@/integrations/firebase/types';
import { useNotices } from '@/hooks/useFirebaseNotices';
import AdminLayout from '@/components/layout/AdminLayout';
import CategoryFilter from '@/components/notice/CategoryFilter';
import NoticeTable from '@/components/notice/NoticeTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Tv, LayoutGrid, FileText, Clock, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    notices,
    removeNotice,
  } = useNotices();

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const handleEditClick = (notice: Notice) => {
    navigate(`/add-notice?edit=${notice.id}`);
  };

  const nowMs = Date.now();
  const filteredNotices = notices.filter(n =>
    (selectedCategory === 'all' || n.category === selectedCategory)
    && !n.isArchived
    && n.endTime.getTime() >= nowMs
  );

  // stats for cards
  const activeNotices = filteredNotices.length;
  const highPriorityNotices = filteredNotices.filter(n => n.priority === 'high').length;

  // check if new (last 5 hrs)
  const isRecent = (notice: Notice) => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    return notice.updatedAt > fiveHoursAgo;
  };
  const recentNotices = filteredNotices.filter(isRecent).length;

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your notice board"
    >
      <div className="container px-4 py-6 md:px-6">
        {/* statistics */}
        <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Notices
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeNotices}</div>
              <p className="text-xs text-muted-foreground">Currently displayed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Priority
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highPriorityNotices}</div>
              <p className="text-xs text-muted-foreground">Urgent notices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Updates
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentNotices}</div>
              <p className="text-xs text-muted-foreground">Last 5 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Notices
              </CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notices.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* actions */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Notice Board</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all department notices
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/tv">
              <Button variant="outline" size="sm" className="gap-2">
                <Tv className="h-4 w-4" />
                <span className="hidden sm:inline">TV Display</span>
              </Button>
            </Link>
            <Button
              onClick={() => navigate('/add-notice')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Notice
            </Button>
          </div>
        </div>

        {/* category filter */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutGrid className="h-4 w-4" />
            Showing <span className="font-semibold text-foreground">{filteredNotices.length}</span> active notice{filteredNotices.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* table of notices */}
        <NoticeTable
          notices={filteredNotices}
          isRecent={isRecent}
          onEdit={handleEditClick}
          onDelete={(id) => removeNotice(id, false)} // soft delete (archive)
        />

        {filteredNotices.length === 0 && (
          <div className="text-center py-16 bg-card rounded-xl border shadow-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No notices found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory === 'all'
                ? 'Get started by adding your first notice.'
                : `No active notices in the ${selectedCategory} category.`}
            </p>
            <Button onClick={() => navigate('/add-notice')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Notice
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
