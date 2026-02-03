import React from 'react';
import { Category } from '@/types/notice';
import { Button } from '@/components/ui/button';
import { Briefcase, BookOpen, FolderKanban, Sparkles, LayoutGrid, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
}

const categories: { value: Category | 'all'; label: string; icon: React.ReactNode; colorClass: string }[] = [
  { value: 'all', label: 'All Notices', icon: <LayoutGrid className="h-4 w-4" />, colorClass: 'bg-secondary text-secondary-foreground' },
  { value: 'placement', label: 'Placement', icon: <Briefcase className="h-4 w-4" />, colorClass: 'bg-placement-bg text-placement' },
  { value: 'academic', label: 'Academic', icon: <BookOpen className="h-4 w-4" />, colorClass: 'bg-academic-bg text-academic' },
  { value: 'project', label: 'Project', icon: <FolderKanban className="h-4 w-4" />, colorClass: 'bg-project-bg text-project' },
  { value: 'spiritual', label: 'Spiritual', icon: <Sparkles className="h-4 w-4" />, colorClass: 'bg-spiritual-bg text-spiritual' },
  { value: 'other', label: 'Other', icon: <MoreHorizontal className="h-4 w-4" />, colorClass: 'bg-muted text-muted-foreground' },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(({ value, label, icon, colorClass }) => (
        <Button
          key={value}
          variant="outline"
          size="sm"
          onClick={() => onCategoryChange(value)}
          className={cn(
            'gap-2 transition-all duration-200',
            selectedCategory === value
              ? cn(colorClass, 'border-2 border-current shadow-sm')
              : 'hover:bg-secondary/80'
          )}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
