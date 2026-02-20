import { Category } from '@/integrations/firebase/types';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  BookOpen,
  Megaphone,
  Calendar,
  ClipboardCheck,
  LayoutGrid,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
}

const categories: { value: Category | 'all'; label: string; icon: React.ReactNode; colorClass: string }[] = [
  { value: 'all', label: 'All Notices', icon: <LayoutGrid className="h-4 w-4" />, colorClass: 'bg-secondary text-secondary-foreground' },
  { value: 'academic', label: 'Academic', icon: <BookOpen className="h-4 w-4" />, colorClass: 'bg-blue-100 text-blue-700' },
  { value: 'examinations', label: 'Examinations', icon: <ClipboardCheck className="h-4 w-4" />, colorClass: 'bg-red-100 text-red-700' },
  { value: 'placements', label: 'Placements', icon: <Briefcase className="h-4 w-4" />, colorClass: 'bg-primary/10 text-primary' },
  { value: 'events', label: 'Events', icon: <Calendar className="h-4 w-4" />, colorClass: 'bg-purple-100 text-purple-700' },
  { value: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" />, colorClass: 'bg-orange-100 text-orange-700' },
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
