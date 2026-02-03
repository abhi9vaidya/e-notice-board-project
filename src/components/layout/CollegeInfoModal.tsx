import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Building2, 
  Users, 
  BookOpen, 
  Bell, 
  Clock, 
  CheckCircle2,
  Sparkles,
  Monitor,
  Archive,
  Zap
} from 'lucide-react';

interface CollegeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Instant updates for all department notices and announcements',
    color: 'text-amber-500'
  },
  {
    icon: Clock,
    title: 'Time-Sensitive Alerts',
    description: 'Auto-escalation of notices with approaching deadlines',
    color: 'text-orange-500'
  },
  {
    icon: Monitor,
    title: 'TV Display Mode',
    description: 'Dedicated display for common areas and notice boards',
    color: 'text-blue-500'
  },
  {
    icon: Archive,
    title: 'Notice History',
    description: 'Complete archive of past notices for reference',
    color: 'text-purple-500'
  }
];

const departments = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

const CollegeInfoModal: React.FC<CollegeInfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-card to-card/95 border-2 p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-primary via-primary to-primary/90 px-6 py-8 text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBtLTIgMGEyIDIgMCAxIDAgNCAwIDIgMiAwIDEgMC00IDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
            
            <motion.div 
              className="relative flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg">
                <GraduationCap className="h-9 w-9" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">RCOEM</h2>
                <p className="text-sm opacity-90">Ramdeobaba College of Engineering & Management</p>
                <p className="text-xs opacity-75 mt-1">Nagpur, Maharashtra</p>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-6">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">About Department</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Faculty E-Notice Board is a digital solution designed to streamline 
                communication between faculty and students. It provides real-time updates 
                on placements, academics, projects, and other important announcements.
              </p>
            </motion.div>

            {/* Departments */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Departments</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept, index) => (
                  <motion.div
                    key={dept}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      {dept}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">How E-Notice Helps</h3>
              </div>
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className={`mt-0.5 ${feature.color}`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Key Benefits</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Never miss important placement drives',
                  'Stay updated with academic schedules',
                  'Track project submission deadlines',
                  'Receive urgent notifications instantly'
                ].map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CollegeInfoModal;
